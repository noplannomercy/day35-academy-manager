import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import {
  errorResponse,
  updateOverduePayments,
  calculateDaysOverdue,
  parseBooleanParam,
} from '@/lib/api-utils';
import type { ApiResponse } from '@/types';

// ========================================
// GET /api/payments/unpaid
// ========================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const includeOverdue = parseBooleanParam(searchParams.get('includeOverdue'), true);

    const db = readDatabase();
    let payments = db.payments;

    // Auto-update overdue payments
    payments = updateOverduePayments(payments);

    // Filter unpaid payments
    if (includeOverdue) {
      payments = payments.filter((p) => p.status === 'unpaid' || p.status === 'overdue');
    } else {
      payments = payments.filter((p) => p.status === 'unpaid');
    }

    // Combine with related data and calculate days overdue
    const paymentsWithData = payments.map((payment) => {
      const student = db.students.find((s) => s.id === payment.studentId);
      const cls = db.classes.find((c) => c.id === payment.classId);

      // Calculate days overdue
      const daysOverdue =
        payment.status === 'overdue' ? calculateDaysOverdue(payment.month) : undefined;

      return {
        payment,
        student,
        class: cls,
        daysOverdue,
      };
    });

    // Sort by month descending
    paymentsWithData.sort((a, b) => a.payment.month.localeCompare(b.payment.month));

    // Calculate summary
    const unpaidPayments = paymentsWithData.filter((p) => p.payment.status === 'unpaid');
    const overduePayments = paymentsWithData.filter((p) => p.payment.status === 'overdue');

    const summary = {
      unpaidCount: unpaidPayments.length,
      unpaidAmount: unpaidPayments.reduce((sum, p) => sum + p.payment.amount, 0),
      overdueCount: overduePayments.length,
      overdueAmount: overduePayments.reduce((sum, p) => sum + p.payment.amount, 0),
    };

    return NextResponse.json({
      data: paymentsWithData,
      summary,
    });
  } catch (error) {
    console.error('GET /api/payments/unpaid error:', error);
    return errorResponse('미납 목록 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
