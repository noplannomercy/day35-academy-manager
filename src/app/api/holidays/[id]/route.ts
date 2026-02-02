import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, remove } from '@/lib/storage';
import { findById } from '@/lib/utils';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils';

// ========================================
// DELETE /api/holidays/[id]
// ========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Verify holiday exists
    const db = readDatabase();
    const holiday = findById(db.holidays, id);
    if (!holiday) {
      return notFoundResponse('휴일을 찾을 수 없습니다.');
    }

    // Delete holiday
    const success = remove('holidays', id);

    if (!success) {
      return errorResponse('휴일 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
    }

    return successResponse(null, '휴일이 삭제되었습니다.');
  } catch (error) {
    console.error('DELETE /api/holidays/[id] error:', error);
    return errorResponse('휴일 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
