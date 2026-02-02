import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, update } from '@/lib/storage';
import { errorResponse } from '@/lib/api-utils';

// ========================================
// DELETE /api/waitlist/[id]
// ========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // 1. Find waitlist entry
    const waitlist = db.waitlists.find((w) => w.id === id);
    if (!waitlist) {
      return errorResponse('대기 등록을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // 2. Update status to cancelled (soft delete)
    const updatedWaitlist = update('waitlists', id, {
      status: 'cancelled',
    });

    if (!updatedWaitlist) {
      return errorResponse('대기 취소에 실패했습니다.', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({
      message: '대기가 취소되었습니다.',
    });
  } catch (error) {
    console.error('DELETE /api/waitlist/[id] error:', error);
    return errorResponse('대기 취소에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
