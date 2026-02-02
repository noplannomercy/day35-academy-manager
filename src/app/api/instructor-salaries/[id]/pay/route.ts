import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, update } from '@/lib/storage';
import { getCurrentDate } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import type { InstructorSalary, ApiResponse } from '@/types';

// ========================================
// PATCH /api/instructor-salaries/[id]/pay
// ========================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<InstructorSalary>>> {
  try {
    const { id } = await params;

    // Check if salary exists
    const db = readDatabase();
    const salary = db.instructorSalaries.find((s) => s.id === id);
    if (!salary) {
      return notFoundResponse('급여를 찾을 수 없습니다.');
    }

    // Update salary to paid status
    const updatedSalary = update('instructorSalaries', id, {
      status: 'paid',
      paidDate: getCurrentDate(),
    });

    if (!updatedSalary) {
      return notFoundResponse('급여를 찾을 수 없습니다.');
    }

    return successResponse(updatedSalary, '급여가 지급 처리되었습니다.');
  } catch (error) {
    console.error('PATCH /api/instructor-salaries/[id]/pay error:', error);
    return errorResponse('급여 지급 처리에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
