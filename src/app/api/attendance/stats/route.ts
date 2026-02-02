import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { errorResponse } from '@/lib/api-utils';

// ========================================
// GET /api/attendance/stats
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Filter attendances
    let filteredAttendances = [...db.attendances];

    // Apply classId filter
    if (classId && classId.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.classId === classId);
    }

    // Apply studentId filter
    if (studentId && studentId.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.studentId === studentId);
    }

    // Apply date range filter
    if (startDate && startDate.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.date >= startDate);
    }
    if (endDate && endDate.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.date <= endDate);
    }

    // Group by studentId and classId
    const statsMap = new Map<
      string,
      {
        studentId: string;
        classId: string;
        totalDays: number;
        presentDays: number;
        absentDays: number;
        lateDays: number;
        excusedDays: number;
      }
    >();

    for (const attendance of filteredAttendances) {
      const key = `${attendance.studentId}-${attendance.classId}`;

      if (!statsMap.has(key)) {
        statsMap.set(key, {
          studentId: attendance.studentId,
          classId: attendance.classId,
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          excusedDays: 0,
        });
      }

      const stats = statsMap.get(key)!;
      stats.totalDays += 1;

      switch (attendance.status) {
        case 'present':
          stats.presentDays += 1;
          break;
        case 'absent':
          stats.absentDays += 1;
          break;
        case 'late':
          stats.lateDays += 1;
          break;
        case 'excused':
          stats.excusedDays += 1;
          break;
      }
    }

    // Convert to array and enrich with student and class names
    const statsArray = Array.from(statsMap.values()).map((stats) => {
      const student = db.students.find((s) => s.id === stats.studentId);
      const classData = db.classes.find((c) => c.id === stats.classId);

      const attendanceRate =
        stats.totalDays > 0 ? Math.round((stats.presentDays / stats.totalDays) * 100 * 10) / 10 : 0;

      return {
        studentId: stats.studentId,
        studentName: student?.name || '알 수 없음',
        classId: stats.classId,
        className: classData?.name || '알 수 없음',
        totalDays: stats.totalDays,
        presentDays: stats.presentDays,
        absentDays: stats.absentDays,
        lateDays: stats.lateDays,
        excusedDays: stats.excusedDays,
        attendanceRate,
      };
    });

    return NextResponse.json({
      data: statsArray,
    });
  } catch (error) {
    console.error('GET /api/attendance/stats error:', error);
    return errorResponse('출석 통계를 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
