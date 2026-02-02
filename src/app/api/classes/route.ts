import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime, checkScheduleConflict } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
  getClassCurrentStudents,
} from '@/lib/api-utils';
import { classCreateSchema } from '@/lib/validations';
import type { Class, ClassStatus } from '@/types';

// ========================================
// GET /api/classes
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const status = searchParams.get('status') as ClassStatus | null;
    const subjectId = searchParams.get('subjectId');
    const instructorId = searchParams.get('instructorId');
    const { page, limit } = getPaginationParams(searchParams);

    // Filter classes
    let filteredClasses = [...db.classes];

    // Apply status filter
    if (status && (status === 'active' || status === 'closed')) {
      filteredClasses = filteredClasses.filter((cls) => cls.status === status);
    }

    // Apply subjectId filter
    if (subjectId && subjectId.trim() !== '') {
      filteredClasses = filteredClasses.filter((cls) => cls.subjectId === subjectId);
    }

    // Apply instructorId filter
    if (instructorId && instructorId.trim() !== '') {
      filteredClasses = filteredClasses.filter((cls) => cls.instructorId === instructorId);
    }

    // Get total count before pagination
    const total = filteredClasses.length;

    // Apply pagination
    const paginatedClasses = paginateArray(filteredClasses, page, limit);

    // Enrich with related data
    const enrichedData = paginatedClasses.map((cls) => {
      const instructor = db.instructors.find((i) => i.id === cls.instructorId);
      const subject = db.settings.subjects.find((s) => s.id === cls.subjectId);
      const room = cls.roomId ? db.settings.rooms.find((r) => r.id === cls.roomId) : undefined;
      const currentStudents = getClassCurrentStudents(cls.id, db.enrollments);
      const waitlistCount = db.waitlists.filter(
        (w) => w.classId === cls.id && w.status === 'waiting'
      ).length;

      return {
        class: cls,
        instructor,
        subject,
        room,
        currentStudents,
        waitlistCount,
      };
    });

    // Create pagination metadata
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: enrichedData,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/classes error:', error);
    return errorResponse('반 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/classes
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = classCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;
    const db = readDatabase();

    // Check schedule conflict (instructor and room)
    const conflicts = checkScheduleConflict(
      data.schedule,
      db.classes,
      data.instructorId,
      data.roomId
    );

    if (conflicts.length > 0) {
      // Separate conflicts by type
      const instructorConflicts = conflicts.filter((c) => c.type === 'instructor');
      const roomConflicts = conflicts.filter((c) => c.type === 'room');

      if (instructorConflicts.length > 0) {
        return NextResponse.json(
          {
            error: '시간표 충돌이 발생했습니다.',
            code: 'INSTRUCTOR_SCHEDULE_CONFLICT',
            conflicts,
          },
          { status: 409 }
        );
      }

      if (roomConflicts.length > 0) {
        return NextResponse.json(
          {
            error: '시간표 충돌이 발생했습니다.',
            code: 'ROOM_SCHEDULE_CONFLICT',
            conflicts,
          },
          { status: 409 }
        );
      }
    }

    // Create new class
    const newClass: Class = {
      id: generateId(),
      name: data.name,
      subjectId: data.subjectId,
      instructorId: data.instructorId,
      maxStudents: data.maxStudents,
      schedule: data.schedule,
      monthlyFee: data.monthlyFee,
      status: 'active',
      roomId: data.roomId,
      notes: data.notes,
      createdAt: getCurrentDateTime(),
    };

    // Save to database
    create('classes', newClass);

    return successResponse(newClass, '반이 생성되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/classes error:', error);
    return errorResponse('반 생성에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
