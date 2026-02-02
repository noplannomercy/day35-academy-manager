import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { parseISO, startOfWeek, endOfWeek, format } from 'date-fns';

/**
 * GET /api/schedule/weekly?date=YYYY-MM-DD
 *
 * 주간 시간표 조회
 *
 * Query Params:
 * - date: 기준 날짜 (YYYY-MM-DD, 기본값: 오늘)
 *
 * Response:
 * - weekRange: { start: YYYY-MM-DD, end: YYYY-MM-DD }
 * - data: Array of { dayOfWeek, classes[] }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    // Parse date or use today
    const targetDate = dateParam ? parseISO(dateParam) : new Date();

    // Get week range (Monday to Sunday)
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 }); // Sunday

    const weekRange = {
      start: format(weekStart, 'yyyy-MM-dd'),
      end: format(weekEnd, 'yyyy-MM-dd'),
    };

    const db = readDatabase();

    // Group classes by day of week (0=Sunday, 6=Saturday)
    const weeklySchedule: Array<{
      dayOfWeek: number;
      classes: Array<{
        id: string;
        name: string;
        instructorId: string;
        instructorName: string;
        roomId?: string;
        enrollmentCount: number;
        maxStudents: number;
        startTime: string;
        endTime: string;
      }>;
    }> = [];

    // Initialize all days (0-6)
    for (let day = 0; day <= 6; day++) {
      const dayClasses = db.classes
        .filter(c => c.status === 'active')
        .filter(c => c.schedule.some(s => s.dayOfWeek === day))
        .flatMap(c => {
          const instructor = db.instructors.find(i => i.id === c.instructorId);
          const enrollmentCount = db.enrollments.filter(
            e => e.classId === c.id && e.status === 'active'
          ).length;

          // Get all schedules for this day
          const daySchedules = c.schedule.filter(s => s.dayOfWeek === day);

          return daySchedules.map(s => ({
            id: c.id,
            name: c.name,
            instructorId: c.instructorId,
            instructorName: instructor?.name || 'Unknown',
            roomId: c.roomId,
            enrollmentCount,
            maxStudents: c.maxStudents,
            startTime: s.startTime,
            endTime: s.endTime,
          }));
        })
        .sort((a, b) => a.startTime.localeCompare(b.startTime)); // Sort by start time

      weeklySchedule.push({
        dayOfWeek: day,
        classes: dayClasses,
      });
    }

    return NextResponse.json({
      data: weeklySchedule,
      weekRange,
    });
  } catch (error) {
    console.error('Weekly schedule API error:', error);
    return NextResponse.json(
      {
        error: '주간 시간표를 불러오는 데 실패했습니다.',
        code: 'WEEKLY_SCHEDULE_ERROR',
      },
      { status: 500 }
    );
  }
}
