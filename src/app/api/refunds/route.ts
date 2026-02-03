import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime, getCurrentDate } from '@/lib/utils';
import { refundCreateSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import type { Refund, ApiResponse } from '@/types';

// ========================================
// GET /api/refunds
// ========================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const { page, limit } = getPaginationParams(searchParams);

    const db = readDatabase();
    let refunds = db.refunds;

    // Filter by studentId (through payment)
    if (studentId) {
      const studentPaymentIds = db.payments
        .filter((p) => p.studentId === studentId)
        .map((p) => p.id);
      refunds = refunds.filter((r) => studentPaymentIds.includes(r.paymentId));
    }

    // Filter by date range
    if (startDate) {
      refunds = refunds.filter((r) => r.refundDate >= startDate);
    }
    if (endDate) {
      refunds = refunds.filter((r) => r.refundDate <= endDate);
    }

    // Combine with related data
    const refundsWithData = refunds.map((refund) => {
      const payment = db.payments.find((p) => p.id === refund.paymentId);
      const student = payment ? db.students.find((s) => s.id === payment.studentId) : undefined;
      const cls = payment ? db.classes.find((c) => c.id === payment.classId) : undefined;

      return {
        refund,
        payment,
        student,
        class: cls,
      };
    });

    // Sort by refundDate descending
    refundsWithData.sort((a, b) => b.refund.refundDate.localeCompare(a.refund.refundDate));

    // Paginate
    const total = refundsWithData.length;
    const paginatedData = paginateArray(refundsWithData, page, limit);
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: paginatedData,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/refunds error:', error);
    return errorResponse('환불 목록 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/refunds
// ========================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Refund>>> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = refundCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;
    const db = readDatabase();

    // Find payment
    const payment = db.payments.find((p) => p.id === data.paymentId);
    if (!payment) {
      return errorResponse('존재하지 않는 수납 건입니다.', 'NOT_FOUND', 404);
    }

    // Check if payment status is valid (must be 'paid' or 'partial')
    if (payment.status !== 'paid' && payment.status !== 'partial') {
      return errorResponse(
        '납부되지 않은 건은 환불할 수 없습니다.',
        'INVALID_PAYMENT_STATUS',
        400
      );
    }

    // Calculate total existing refunds for this payment
    const existingRefunds = db.refunds.filter((r) => r.paymentId === data.paymentId);
    const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
    const remainingAmount = payment.paidAmount - totalRefunded;

    // Check if refund amount exceeds remaining amount
    if (data.amount > remainingAmount) {
      return errorResponse(
        `환불 가능 금액은 ${remainingAmount.toLocaleString()}원입니다. (납부: ${payment.paidAmount.toLocaleString()}원, 기환불: ${totalRefunded.toLocaleString()}원)`,
        'REFUND_AMOUNT_EXCEEDS',
        400
      );
    }

    // Create refund
    const newRefund: Refund = {
      id: generateId(),
      paymentId: data.paymentId,
      amount: data.amount,
      reason: data.reason,
      refundDate: getCurrentDate(),
      createdAt: getCurrentDateTime(),
    };

    create('refunds', newRefund);

    return successResponse(newRefund, '환불이 처리되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/refunds error:', error);
    return errorResponse('환불 처리에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
