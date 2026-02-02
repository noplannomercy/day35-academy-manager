import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime, isHoliday } from '@/lib/utils';
import {
  errorResponse,
  successResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import { makeupClassCreateSchema } from '@/lib/validations';
import type { MakeupClass, MakeupStatus } from '@/types';

// ========================================
// GET /api/makeup-classes
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const enrollmentId = searchParams.get('enrollmentId');
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status') as MakeupStatus | null;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const { page, limit } = getPaginationParams(searchParams);

    // Filter makeup classes
    let filteredMakeupClasses = [...db.makeupClasses];

    // Apply enrollmentId filter
    if (enrollmentId && enrollmentId.trim() !== '') {
      filteredMakeupClasses = filteredMakeupClasses.filter(
        (m) => m.enrollmentId === enrollmentId
      );
    }

    // Apply classId filter (through enrollment)
    if (classId && classId.trim() !== '') {
      const enrollmentIds = db.enrollments
        .filter((e) => e.classId === classId)
        .map((e) => e.id);
      filteredMakeupClasses = filteredMakeupClasses.filter((m) =>
        enrollmentIds.includes(m.enrollmentId)
      );
    }

    // Apply studentId filter (through enrollment)
    if (studentId && studentId.trim() !== '') {
      const enrollmentIds = db.enrollments
        .filter((e) => e.studentId === studentId)
        .map((e) => e.id);
      filteredMakeupClasses = filteredMakeupClasses.filter((m) =>
        enrollmentIds.includes(m.enrollmentId)
      );
    }

    // Apply status filter
    if (
      status &&
      (status === 'pending' || status === 'completed' || status === 'cancelled')
    ) {
      filteredMakeupClasses = filteredMakeupClasses.filter((m) => m.status === status);
    }

    // Apply date range filter (scheduledDate)
    if (startDate && startDate.trim() !== '') {
      filteredMakeupClasses = filteredMakeupClasses.filter(
        (m) => m.scheduledDate >= startDate
      );
    }
    if (endDate && endDate.trim() !== '') {
      filteredMakeupClasses = filteredMakeupClasses.filter((m) => m.scheduledDate <= endDate);
    }

    // Get total count before pagination
    const total = filteredMakeupClasses.length;

    // Apply pagination
    const paginatedMakeupClasses = paginateArray(filteredMakeupClasses, page, limit);

    // Enrich with enrollment, student, and class data
    const enrichedData = paginatedMakeupClasses.map((makeupClass) => {
      const enrollment = db.enrollments.find((e) => e.id === makeupClass.enrollmentId);
      const student = enrollment
        ? db.students.find((s) => s.id === enrollment.studentId)
        : undefined;
      const classData = enrollment
        ? db.classes.find((c) => c.id === enrollment.classId)
        : undefined;

      return {
        makeupClass,
        enrollment,
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
    console.error('GET /api/makeup-classes error:', error);
    return errorResponse('보강 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/makeup-classes
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = makeupClassCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { enrollmentId, absenceDate, scheduledDate, scheduledTime } = validation.data;
    const db = readDatabase();

    // 1. Check if enrollment exists
    const enrollment = db.enrollments.find((e) => e.id === enrollmentId);
    if (!enrollment) {
      return errorResponse('수강 정보를 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // 2. Check if there's an absence record for the absenceDate
    const absenceRecord = db.attendances.find(
      (a) =>
        a.classId === enrollment.classId &&
        a.studentId === enrollment.studentId &&
        a.date === absenceDate &&
        a.status === 'absent'
    );

    if (!absenceRecord) {
      return NextResponse.json(
        {
          error: '해당 날짜에 결석 기록이 없습니다.',
          code: 'NO_ABSENCE_RECORD',
        },
        { status: 400 }
      );
    }

    // 3. Check if the scheduledDate is a holiday
    const holiday = isHoliday(scheduledDate, db.holidays);
    if (holiday) {
      return NextResponse.json(
        {
          error: '휴일에는 보강을 예약할 수 없습니다.',
          code: 'HOLIDAY_NOT_ALLOWED',
          holiday,
        },
        { status: 409 }
      );
    }

    // 4. Create makeup class
    const newMakeupClass: MakeupClass = {
      id: generateId(),
      enrollmentId,
      absenceDate,
      scheduledDate,
      scheduledTime,
      status: 'pending',
      createdAt: getCurrentDateTime(),
    };

    create('makeupClasses', newMakeupClass);

    return successResponse(newMakeupClass, '보강이 예약되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/makeup-classes error:', error);
    return errorResponse('보강 예약에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
