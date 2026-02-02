import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, update } from '@/lib/storage';
import { getCurrentDate } from '@/lib/utils';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils';

// ========================================
// PATCH /api/enrollments/[id]/drop
// ========================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // Find enrollment
    const enrollment = db.enrollments.find((e) => e.id === id);
    if (!enrollment) {
      return notFoundResponse('수강 정보를 찾을 수 없습니다.');
    }

    // Check if already dropped
    if (enrollment.status === 'dropped') {
      return errorResponse('이미 취소된 수강입니다.', 'INACTIVE_ENROLLMENT', 400);
    }

    // Update enrollment status to dropped
    const updatedEnrollment = update('enrollments', id, {
      status: 'dropped',
      droppedDate: getCurrentDate(),
    });

    if (!updatedEnrollment) {
      return notFoundResponse('수강 정보를 찾을 수 없습니다.');
    }

    return successResponse(updatedEnrollment, '수강이 취소되었습니다.');
  } catch (error) {
    console.error('PATCH /api/enrollments/[id]/drop error:', error);
    return errorResponse('수강 취소에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
