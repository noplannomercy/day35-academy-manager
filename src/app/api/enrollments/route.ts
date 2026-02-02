import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create, createWaitlist } from '@/lib/storage';
import { generateId, getCurrentDate, getCurrentDateTime } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
  getClassCurrentStudents,
} from '@/lib/api-utils';
import { enrollmentCreateSchema } from '@/lib/validations';
import type { Enrollment, EnrollmentStatus, ConflictResult } from '@/types';

// ========================================
// GET /api/enrollments
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status') as EnrollmentStatus | null;
    const { page, limit } = getPaginationParams(searchParams);

    // Filter enrollments
    let filteredEnrollments = [...db.enrollments];

    // Apply classId filter
    if (classId && classId.trim() !== '') {
      filteredEnrollments = filteredEnrollments.filter((e) => e.classId === classId);
    }

    // Apply studentId filter
    if (studentId && studentId.trim() !== '') {
      filteredEnrollments = filteredEnrollments.filter((e) => e.studentId === studentId);
    }

    // Apply status filter
    if (status && (status === 'active' || status === 'dropped')) {
      filteredEnrollments = filteredEnrollments.filter((e) => e.status === status);
    }

    // Get total count before pagination
    const total = filteredEnrollments.length;

    // Apply pagination
    const paginatedEnrollments = paginateArray(filteredEnrollments, page, limit);

    // Enrich with student and class data
    const enrichedData = paginatedEnrollments.map((enrollment) => {
      const student = db.students.find((s) => s.id === enrollment.studentId);
      const classData = db.classes.find((c) => c.id === enrollment.classId);

      return {
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
    console.error('GET /api/enrollments error:', error);
    return errorResponse('수강 현황을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/enrollments
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = enrollmentCreateSchema.safeParse(body);
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

    // 2. Check if student is withdrawn
    if (student.status === 'withdrawn') {
      return errorResponse(
        '퇴원한 수강생은 수강 등록할 수 없습니다.',
        'STUDENT_WITHDRAWN',
        400
      );
    }

    // 3. Check if class exists
    const classData = db.classes.find((c) => c.id === classId);
    if (!classData) {
      return errorResponse('반을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // 4. Check if class is closed
    if (classData.status === 'closed') {
      return errorResponse('종료된 반에는 수강 등록할 수 없습니다.', 'CLASS_CLOSED', 400);
    }

    // 5. Check for duplicate enrollment (same student + same class + active)
    const existingEnrollment = db.enrollments.find(
      (e) => e.studentId === studentId && e.classId === classId && e.status === 'active'
    );

    if (existingEnrollment) {
      return errorResponse(
        '이미 해당 반에 수강 등록되어 있습니다.',
        'DUPLICATE_ENROLLMENT',
        409
      );
    }

    // 6. Check class capacity
    const currentStudents = getClassCurrentStudents(classId, db.enrollments);
    if (currentStudents >= classData.maxStudents) {
      // Class is full - create waitlist instead
      const waitlist = createWaitlist(studentId, classId, getCurrentDateTime());

      return NextResponse.json(
        {
          error: '정원이 초과되어 대기자로 등록되었습니다.',
          code: 'CLASS_FULL_WAITLISTED',
          data: waitlist,
        },
        { status: 409 }
      );
    }

    // 7. Check for student schedule conflicts (WARNING, not blocking)
    const studentActiveEnrollments = db.enrollments.filter(
      (e) => e.studentId === studentId && e.status === 'active'
    );

    const conflicts: ConflictResult[] = [];

    for (const enrollment of studentActiveEnrollments) {
      const enrolledClass = db.classes.find((c) => c.id === enrollment.classId);
      if (!enrolledClass) continue;

      // Compare schedules
      for (const newSlot of classData.schedule) {
        for (const existingSlot of enrolledClass.schedule) {
          if (newSlot.dayOfWeek === existingSlot.dayOfWeek) {
            // Check time overlap
            const newStart = timeToMinutes(newSlot.startTime);
            const newEnd = timeToMinutes(newSlot.endTime);
            const existingStart = timeToMinutes(existingSlot.startTime);
            const existingEnd = timeToMinutes(existingSlot.endTime);

            if (newStart < existingEnd && existingStart < newEnd) {
              conflicts.push({
                type: 'student',
                classId: enrolledClass.id,
                className: enrolledClass.name,
                dayOfWeek: newSlot.dayOfWeek,
                time: `${newSlot.startTime}-${newSlot.endTime}`,
              });
            }
          }
        }
      }
    }

    // 8. Create enrollment (even if there are conflicts - just warn)
    const newEnrollment: Enrollment = {
      id: generateId(),
      studentId,
      classId,
      enrollDate: getCurrentDate(),
      status: 'active',
    };

    create('enrollments', newEnrollment);

    // 9. Return response with optional warning
    if (conflicts.length > 0) {
      return NextResponse.json(
        {
          data: newEnrollment,
          message: '수강 등록이 완료되었습니다.',
          warning: '기존 수강 반과 시간표가 충돌합니다.',
          conflicts,
        },
        { status: 200 }
      );
    }

    return successResponse(newEnrollment, '수강 등록이 완료되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/enrollments error:', error);
    return errorResponse('수강 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// Helper Functions
// ========================================

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
