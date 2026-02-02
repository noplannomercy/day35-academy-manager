import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime, getCurrentDate } from '@/lib/utils';
import { paymentCreateSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  conflictResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
  updateOverduePayments,
} from '@/lib/api-utils';
import type { Payment, PaymentStatus, ApiResponse } from '@/types';

// ========================================
// GET /api/payments
// ========================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const status = searchParams.get('status') as PaymentStatus | null;
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const { page, limit } = getPaginationParams(searchParams);

    const db = readDatabase();
    let payments = db.payments;

    // Auto-update overdue payments
    payments = updateOverduePayments(payments);

    // Filter by month
    if (month) {
      payments = payments.filter((p) => p.month === month);
    }

    // Filter by status
    if (status) {
      payments = payments.filter((p) => p.status === status);
    }

    // Filter by studentId
    if (studentId) {
      payments = payments.filter((p) => p.studentId === studentId);
    }

    // Filter by classId
    if (classId) {
      payments = payments.filter((p) => p.classId === classId);
    }

    // Calculate summary
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    const paidAmount = payments
      .filter((p) => p.status === 'paid' || p.status === 'partial')
      .reduce((sum, p) => sum + p.paidAmount, 0);
    const unpaidAmount = totalAmount - paidAmount;

    const summary = {
      totalAmount,
      paidAmount,
      unpaidAmount,
    };

    // Combine payments with related data
    const paymentsWithData = payments.map((payment) => {
      const student = db.students.find((s) => s.id === payment.studentId);
      const cls = db.classes.find((c) => c.id === payment.classId);
      const refunds = db.refunds.filter((r) => r.paymentId === payment.id);

      return {
        payment,
        student,
        class: cls,
        refunds,
      };
    });

    // Sort by month descending, then by createdAt descending
    paymentsWithData.sort((a, b) => {
      const monthCompare = b.payment.month.localeCompare(a.payment.month);
      if (monthCompare !== 0) return monthCompare;
      return (
        new Date(b.payment.createdAt).getTime() - new Date(a.payment.createdAt).getTime()
      );
    });

    // Paginate
    const total = paymentsWithData.length;
    const paginatedData = paginateArray(paymentsWithData, page, limit);
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: paginatedData,
      pagination,
      summary,
    });
  } catch (error) {
    console.error('GET /api/payments error:', error);
    return errorResponse('수납 목록 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/payments
// ========================================

export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<Payment>>> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = paymentCreateSchema.safeParse(body);
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

    // Check if student exists
    const student = db.students.find((s) => s.id === data.studentId);
    if (!student) {
      return errorResponse('존재하지 않는 수강생입니다.', 'NOT_FOUND', 404);
    }

    // Check if student is inactive (block payment creation)
    if (student.status === 'inactive') {
      return errorResponse(
        '일시중단 상태의 수강생은 수납 등록이 불가합니다.',
        'STUDENT_INACTIVE',
        400
      );
    }

    // Check if class exists
    const cls = db.classes.find((c) => c.id === data.classId);
    if (!cls) {
      return errorResponse('존재하지 않는 반입니다.', 'NOT_FOUND', 404);
    }

    // Check for duplicate payment (same studentId + classId + month)
    const duplicate = db.payments.find(
      (p) =>
        p.studentId === data.studentId &&
        p.classId === data.classId &&
        p.month === data.month
    );
    if (duplicate) {
      return conflictResponse(
        '이미 해당 월의 수납 건이 존재합니다.',
        'DUPLICATE_PAYMENT'
      );
    }

    // Create payment
    const newPayment: Payment = {
      id: generateId(),
      studentId: data.studentId,
      classId: data.classId,
      amount: data.amount,
      paidAmount: 0,
      month: data.month,
      status: 'unpaid',
      isProrated: data.isProrated || false,
      notes: data.notes,
      createdAt: getCurrentDateTime(),
    };

    create('payments', newPayment);

    return successResponse(newPayment, '수납이 등록되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/payments error:', error);
    return errorResponse('수납 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
