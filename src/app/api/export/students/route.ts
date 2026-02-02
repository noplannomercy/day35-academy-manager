import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';

/**
 * GET /api/export/students?status=active
 *
 * 수강생 목록 CSV 내보내기
 *
 * Query Params:
 * - status: 필터링할 상태 (optional, active/inactive/withdrawn)
 *
 * Response: CSV file download
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status');

    const db = readDatabase();

    // Filter students by status if provided
    let students = db.students;
    if (statusFilter) {
      students = students.filter(s => s.status === statusFilter);
    }

    // Build CSV content
    const headers = ['이름', '전화번호', '학부모 전화번호', '레벨', '등록일', '상태', '비고'];
    const rows = students.map(s => {
      const level = s.levelId
        ? db.settings.levels.find(l => l.id === s.levelId)?.name || ''
        : '';

      return [
        s.name,
        s.phone,
        s.parentPhone || '',
        level,
        s.enrollDate,
        s.status === 'active' ? '활성' : s.status === 'inactive' ? '비활성' : '탈퇴',
        s.notes || '',
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
        'Content-Disposition': `attachment; filename="students-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Students export error:', error);
    return NextResponse.json(
      {
        error: '수강생 목록 내보내기에 실패했습니다.',
        code: 'STUDENTS_EXPORT_ERROR',
      },
      { status: 500 }
    );
  }
}
