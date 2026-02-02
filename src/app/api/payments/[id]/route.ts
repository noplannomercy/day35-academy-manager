import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { errorResponse, notFoundResponse, updateOverduePayments } from '@/lib/api-utils';
import type { ApiResponse } from '@/types';

// ========================================
// GET /api/payments/[id]
// ========================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // Find payment
    let payment = db.payments.find((p) => p.id === id);
    if (!payment) {
      return notFoundResponse('수납 건을 찾을 수 없습니다.');
    }

    // Auto-update overdue status
    const updatedPayments = updateOverduePayments([payment]);
    payment = updatedPayments[0];

    // Get related data
    const student = db.students.find((s) => s.id === payment.studentId);
    const cls = db.classes.find((c) => c.id === payment.classId);
    const refunds = db.refunds.filter((r) => r.paymentId === payment.id);

    return NextResponse.json({
      data: {
        payment,
        student,
        class: cls,
        refunds,
      },
    });
  } catch (error) {
    console.error('GET /api/payments/[id] error:', error);
    return errorResponse('수납 상세 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
