import { NextRequest, NextResponse } from 'next/server';
import { update } from '@/lib/storage';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { makeupClassUpdateSchema } from '@/lib/validations';

// ========================================
// PATCH /api/makeup-classes/[id]
// ========================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = makeupClassUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { status } = validation.data;

    // Update makeup class status
    const updatedMakeupClass = update('makeupClasses', id, {
      status,
    });

    if (!updatedMakeupClass) {
      return errorResponse('보강을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    return successResponse(updatedMakeupClass, '보강 상태가 변경되었습니다.');
  } catch (error) {
    console.error('PATCH /api/makeup-classes/[id] error:', error);
    return errorResponse('보강 상태 변경에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
