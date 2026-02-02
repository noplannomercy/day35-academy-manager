import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime } from '@/lib/utils';
import { instructorSalaryCreateSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  conflictResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import type { InstructorSalary, SalaryStatus, ApiResponse } from '@/types';

// ========================================
// GET /api/instructor-salaries
// ========================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const instructorId = searchParams.get('instructorId');
    const month = searchParams.get('month');
    const status = searchParams.get('status') as SalaryStatus | null;
    const { page, limit } = getPaginationParams(searchParams);

    const db = readDatabase();
    let salaries = db.instructorSalaries;

    // Filter by instructorId
    if (instructorId) {
      salaries = salaries.filter((s) => s.instructorId === instructorId);
    }

    // Filter by month
    if (month) {
      salaries = salaries.filter((s) => s.month === month);
    }

    // Filter by status
    if (status) {
      salaries = salaries.filter((s) => s.status === status);
    }

    // Calculate summary
    const summary = {
      totalAmount: salaries.reduce((sum, s) => sum + s.amount, 0),
      paidAmount: salaries.filter((s) => s.status === 'paid').reduce((sum, s) => sum + s.amount, 0),
      unpaidAmount: salaries
        .filter((s) => s.status === 'unpaid')
        .reduce((sum, s) => sum + s.amount, 0),
    };

    // Combine salaries with instructor data
    const salariesWithInstructor = salaries.map((salary) => {
      const instructor = db.instructors.find((i) => i.id === salary.instructorId);
      return {
        salary,
        instructor,
      };
    });

    // Sort by month descending, then by createdAt descending
    salariesWithInstructor.sort((a, b) => {
      const monthCompare = b.salary.month.localeCompare(a.salary.month);
      if (monthCompare !== 0) return monthCompare;
      return (
        new Date(b.salary.createdAt).getTime() - new Date(a.salary.createdAt).getTime()
      );
    });

    // Paginate
    const total = salariesWithInstructor.length;
    const paginatedData = paginateArray(salariesWithInstructor, page, limit);
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: paginatedData,
      pagination,
      summary,
    });
  } catch (error) {
    console.error('GET /api/instructor-salaries error:', error);
    return errorResponse('급여 목록 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/instructor-salaries
// ========================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<InstructorSalary>>> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = instructorSalaryCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;

    // Check if instructor exists
    const db = readDatabase();
    const instructor = db.instructors.find((i) => i.id === data.instructorId);
    if (!instructor) {
      return validationErrorResponse('존재하지 않는 강사입니다.');
    }

    // Check for duplicate salary (same instructor + month)
    const duplicate = db.instructorSalaries.find(
      (s) => s.instructorId === data.instructorId && s.month === data.month
    );
    if (duplicate) {
      return conflictResponse(
        '이미 해당 월의 급여가 등록되어 있습니다.',
        'DUPLICATE_SALARY'
      );
    }

    // Create salary
    const newSalary: InstructorSalary = {
      id: generateId(),
      instructorId: data.instructorId,
      month: data.month,
      amount: data.amount,
      status: 'unpaid',
      notes: data.notes,
      createdAt: getCurrentDateTime(),
    };

    create('instructorSalaries', newSalary);

    return successResponse(newSalary, '급여가 등록되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/instructor-salaries error:', error);
    return errorResponse('급여 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
