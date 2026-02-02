import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';

/**
 * GET /api/export/attendance?classId=xxx
 *
 * 출석 내역 CSV 내보내기
 *
 * Query Params:
 * - classId: 반 ID (필수)
 *
 * Response: CSV file download
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json(
        {
          error: '반 ID를 입력해주세요.',
          code: 'CLASS_ID_REQUIRED',
        },
        { status: 400 }
      );
    }

    const db = readDatabase();

    // Check if class exists
    const classInfo = db.classes.find(c => c.id === classId);
    if (!classInfo) {
      return NextResponse.json(
        {
          error: '반을 찾을 수 없습니다.',
          code: 'CLASS_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Get all attendances for this class
    const attendances = db.attendances
      .filter(a => a.classId === classId)
      .sort((a, b) => {
        // Sort by date descending, then by student name
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        const studentA = db.students.find(s => s.id === a.studentId);
        const studentB = db.students.find(s => s.id === b.studentId);
        return (studentA?.name || '').localeCompare(studentB?.name || '');
      });

    // Build CSV content
    const headers = ['날짜', '수강생명', '출석상태', '비고'];

    const rows = attendances.map(a => {
      const student = db.students.find(s => s.id === a.studentId);

      const statusLabel =
        a.status === 'present'
          ? '출석'
          : a.status === 'absent'
            ? '결석'
            : a.status === 'late'
              ? '지각'
              : '사유결석';

      return [
        a.date,
        student?.name || 'Unknown',
        statusLabel,
        a.notes || '',
      ];
    });

    // Create CSV string
    const csvRows = [
      [`반명: ${classInfo.name}`],
      [],
      headers,
      ...rows,
    ];

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
        'Content-Disposition': `attachment; filename="attendance-${classInfo.name}-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Attendance export error:', error);
    return NextResponse.json(
      {
        error: '출석 내역 내보내기에 실패했습니다.',
        code: 'ATTENDANCE_EXPORT_ERROR',
      },
      { status: 500 }
    );
  }
}
