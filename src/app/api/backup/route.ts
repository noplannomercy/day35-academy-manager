import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/storage';
import type { Database } from '@/types';

/**
 * GET /api/backup
 *
 * 데이터베이스 전체 백업 (JSON 다운로드)
 *
 * Response: JSON file download
 */
export async function GET(): Promise<NextResponse> {
  try {
    const db = readDatabase();

    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      data: db,
    };

    const jsonStr = JSON.stringify(backup, null, 2);

    return new NextResponse(jsonStr, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="academy-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json(
      {
        error: '백업 생성에 실패했습니다.',
        code: 'BACKUP_EXPORT_ERROR',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/backup
 *
 * 데이터베이스 복원 (백업 파일 업로드)
 *
 * Request Body:
 * {
 *   version: string,
 *   exportedAt: string,
 *   data: Database
 * }
 *
 * Response:
 * - message: 복원 완료 메시지
 * - stats: 복원된 데이터 통계
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate backup format
    if (!body.version || !body.data) {
      return NextResponse.json(
        {
          error: '잘못된 백업 파일 형식입니다.',
          code: 'INVALID_BACKUP_FORMAT',
        },
        { status: 400 }
      );
    }

    const backupData = body.data as Database;

    // Validate required fields
    if (
      !Array.isArray(backupData.students) ||
      !Array.isArray(backupData.instructors) ||
      !Array.isArray(backupData.classes) ||
      !backupData.settings
    ) {
      return NextResponse.json(
        {
          error: '백업 파일에 필수 데이터가 누락되었습니다.',
          code: 'INCOMPLETE_BACKUP_DATA',
        },
        { status: 400 }
      );
    }

    // Restore database
    writeDatabase(backupData);

    // Calculate stats
    const stats = {
      students: backupData.students.length,
      instructors: backupData.instructors.length,
      classes: backupData.classes.length,
      enrollments: backupData.enrollments.length,
      payments: backupData.payments.length,
      attendances: backupData.attendances.length,
      consultations: backupData.consultations.length,
      makeupClasses: backupData.makeupClasses.length,
      waitlists: backupData.waitlists.length,
      instructorSalaries: backupData.instructorSalaries.length,
      holidays: backupData.holidays.length,
      refunds: backupData.refunds.length,
    };

    return NextResponse.json({
      message: '데이터가 성공적으로 복원되었습니다.',
      stats,
    });
  } catch (error) {
    console.error('Backup restore error:', error);
    return NextResponse.json(
      {
        error: '백업 복원에 실패했습니다.',
        code: 'BACKUP_RESTORE_ERROR',
      },
      { status: 500 }
    );
  }
}
