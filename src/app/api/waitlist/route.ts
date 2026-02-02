import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, createWaitlist } from '@/lib/storage';
import { getCurrentDateTime } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import { waitlistCreateSchema } from '@/lib/validations';
import type { WaitlistStatus } from '@/types';

// ========================================
// GET /api/waitlist
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status') as WaitlistStatus | null;
    const { page, limit } = getPaginationParams(searchParams);

    // Filter waitlists
    let filteredWaitlists = [...db.waitlists];

    // Apply classId filter
    if (classId && classId.trim() !== '') {
      filteredWaitlists = filteredWaitlists.filter((w) => w.classId === classId);
    }

    // Apply studentId filter
    if (studentId && studentId.trim() !== '') {
      filteredWaitlists = filteredWaitlists.filter((w) => w.studentId === studentId);
    }

    // Apply status filter
    if (status && (status === 'waiting' || status === 'enrolled' || status === 'cancelled')) {
      filteredWaitlists = filteredWaitlists.filter((w) => w.status === status);
    }

    // Sort by priority ascending (FIFO - lower priority number = registered earlier)
    filteredWaitlists.sort((a, b) => a.priority - b.priority);

    // Get total count before pagination
    const total = filteredWaitlists.length;

    // Apply pagination
    const paginatedWaitlists = paginateArray(filteredWaitlists, page, limit);

    // Enrich with student and class data
    const enrichedData = paginatedWaitlists.map((waitlist) => {
      const student = db.students.find((s) => s.id === waitlist.studentId);
      const classData = db.classes.find((c) => c.id === waitlist.classId);

      return {
        waitlist,
        student,
        class: classData,
      };
    });

    // Create pagination metadata
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: enrichedData,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/waitlist error:', error);
    return errorResponse('대기자 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/waitlist
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = waitlistCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { studentId, classId } = validation.data;
    const db = readDatabase();

    // 1. Check if student exists
    const student = db.students.find((s) => s.id === studentId);
    if (!student) {
      return errorResponse('수강생을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // 2. Check if class exists
    const classData = db.classes.find((c) => c.id === classId);
    if (!classData) {
      return errorResponse('반을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // 3. Check for duplicate waitlist (same student + same class + status=waiting)
    const existingWaitlist = db.waitlists.find(
      (w) => w.studentId === studentId && w.classId === classId && w.status === 'waiting'
    );

    if (existingWaitlist) {
      return errorResponse(
        '이미 대기 등록되어 있습니다.',
        'DUPLICATE_WAITLIST',
        409
      );
    }

    // 4. Create waitlist with auto-calculated priority
    const newWaitlist = createWaitlist(studentId, classId, getCurrentDateTime());

    // 5. Calculate position in queue (same as priority since FIFO)
    const position = newWaitlist.priority;

    return NextResponse.json(
      {
        data: newWaitlist,
        message: '대기 등록이 완료되었습니다.',
        position,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/waitlist error:', error);
    return errorResponse('대기 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
