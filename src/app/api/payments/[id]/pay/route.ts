import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, update } from '@/lib/storage';
import { getCurrentDate } from '@/lib/utils';
import { paymentPaySchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import { PARTIAL_PAYMENT_RATIO } from '@/lib/constants';
import type { Payment, ApiResponse, PaymentStatus } from '@/types';

// ========================================
// PATCH /api/payments/[id]/pay
// ========================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Payment>>> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = paymentPaySchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { paymentType, method } = validation.data;
    const db = readDatabase();

    // Find payment
    const payment = db.payments.find((p) => p.id === id);
    if (!payment) {
      return notFoundResponse('수납 건을 찾을 수 없습니다.');
    }

    // Calculate paid amount and status based on payment type
    let paidAmount: number;
    let status: PaymentStatus;

    if (paymentType === 'full') {
      paidAmount = payment.amount;
      status = 'paid';
    } else {
      // paymentType === 'half'
      paidAmount = Math.round(payment.amount * PARTIAL_PAYMENT_RATIO);
      status = 'partial';
    }

    // Update payment
    const updatedPayment = update('payments', id, {
      paidAmount,
      status,
      paidDate: getCurrentDate(),
      method,
    });

    if (!updatedPayment) {
      return notFoundResponse('수납 건을 찾을 수 없습니다.');
    }

    return successResponse(updatedPayment, '납부 처리가 완료되었습니다.');
  } catch (error) {
    console.error('PATCH /api/payments/[id]/pay error:', error);
    return errorResponse('납부 처리에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
