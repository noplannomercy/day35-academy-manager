import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';

/**
 * GET /api/export/payments?month=2026-02
 *
 * 수납 내역 CSV 내보내기
 *
 * Query Params:
 * - month: 필터링할 월 (optional, YYYY-MM)
 *
 * Response: CSV file download
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const monthFilter = searchParams.get('month');

    const db = readDatabase();

    // Filter payments by month if provided
    let payments = db.payments;
    if (monthFilter) {
      payments = payments.filter(p => p.month === monthFilter);
    }

    // Build CSV content
    const headers = [
      '수강생명',
      '반명',
      '청구금액',
      '납입금액',
      '상태',
      '월',
      '납입일',
      '납입방법',
      '할인(정률)',
      '비고',
    ];

    const rows = payments.map(p => {
      const student = db.students.find(s => s.id === p.studentId);
      const classInfo = db.classes.find(c => c.id === p.classId);

      const statusLabel =
        p.status === 'paid'
          ? '완납'
          : p.status === 'partial'
            ? '부분납부'
            : p.status === 'unpaid'
              ? '미납'
              : '연체';

      const methodLabel =
        p.method === 'cash'
          ? '현금'
          : p.method === 'card'
            ? '카드'
            : p.method === 'transfer'
              ? '계좌이체'
              : '';

      return [
        student?.name || 'Unknown',
        classInfo?.name || 'Unknown',
        p.amount.toString(),
        p.paidAmount.toString(),
        statusLabel,
        p.month,
        p.paidDate || '',
        methodLabel,
        p.isProrated ? '정률' : '',
        p.notes || '',
      ];
    });

    // Create CSV string
    const csvRows = [headers, ...rows];
    const csvContent = csvRows
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    // Add BOM for proper Korean encoding in Excel
    const bom = '\uFEFF';
    const csvWithBom = bom + csvContent;

    return new NextResponse(csvWithBom, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Payments export error:', error);
    return NextResponse.json(
      {
        error: '수납 내역 내보내기에 실패했습니다.',
        code: 'PAYMENTS_EXPORT_ERROR',
      },
      { status: 500 }
    );
  }
}
