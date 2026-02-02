import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime } from '@/lib/utils';
import { instructorCreateSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import type { Instructor, InstructorStatus, ApiResponse } from '@/types';

// ========================================
// GET /api/instructors
// ========================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as InstructorStatus | null;
    const subjectId = searchParams.get('subjectId');
    const { page, limit } = getPaginationParams(searchParams);

    const db = readDatabase();
    let instructors = db.instructors;

    // Filter by status
    if (status) {
      instructors = instructors.filter((i) => i.status === status);
    }

    // Filter by subjectId
    if (subjectId) {
      instructors = instructors.filter((i) => i.subjectIds.includes(subjectId));
    }

    // Calculate classCount and studentCount for each instructor
    const instructorsWithStats = instructors.map((instructor) => {
      // Count active classes for this instructor
      const classCount = db.classes.filter(
        (c) => c.instructorId === instructor.id && c.status === 'active'
      ).length;

      // Count students in active classes of this instructor
      const activeClassIds = db.classes
        .filter((c) => c.instructorId === instructor.id && c.status === 'active')
        .map((c) => c.id);

      const studentCount = db.enrollments.filter(
        (e) => activeClassIds.includes(e.classId) && e.status === 'active'
      ).length;

      return {
        instructor,
        classCount,
        studentCount,
      };
    });

    // Sort by createdAt descending
    instructorsWithStats.sort(
      (a, b) =>
        new Date(b.instructor.createdAt).getTime() - new Date(a.instructor.createdAt).getTime()
    );

    // Paginate
    const total = instructorsWithStats.length;
    const paginatedData = paginateArray(instructorsWithStats, page, limit);
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: paginatedData,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/instructors error:', error);
    return errorResponse('강사 목록 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/instructors
// ========================================

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<Instructor>>> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = instructorCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;

    // Verify subjects exist
    const db = readDatabase();
    const validSubjects = data.subjectIds.every((subjectId) =>
      db.settings.subjects.some((s) => s.id === subjectId)
    );

    if (!validSubjects) {
      return validationErrorResponse('유효하지 않은 과목이 포함되어 있습니다.');
    }

    // Create instructor
    const newInstructor: Instructor = {
      id: generateId(),
      name: data.name,
      phone: data.phone,
      email: data.email,
      subjectIds: data.subjectIds,
      monthlySalary: data.monthlySalary,
      status: 'active',
      color: data.color,
      notes: data.notes,
      createdAt: getCurrentDateTime(),
    };

    create('instructors', newInstructor);

    return successResponse(newInstructor, '강사가 등록되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/instructors error:', error);
    return errorResponse('강사 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
