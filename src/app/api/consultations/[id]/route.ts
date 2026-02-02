import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, remove } from '@/lib/storage';
import { findById } from '@/lib/utils';
import { successResponse, errorResponse, notFoundResponse } from '@/lib/api-utils';

// ========================================
// DELETE /api/consultations/[id]
// ========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Verify consultation exists
    const db = readDatabase();
    const consultation = findById(db.consultations, id);
    if (!consultation) {
      return notFoundResponse('상담 기록을 찾을 수 없습니다.');
    }

    // Delete consultation
    const success = remove('consultations', id);

    if (!success) {
      return errorResponse('상담 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
    }

    return successResponse(null, '상담 기록이 삭제되었습니다.');
  } catch (error) {
    console.error('DELETE /api/consultations/[id] error:', error);
    return errorResponse('상담 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
