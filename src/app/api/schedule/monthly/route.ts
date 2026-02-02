import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { eachDayOfInterval, getDay, format } from 'date-fns';

/**
 * GET /api/schedule/monthly?year=2026&month=2
 *
 * 월간 시간표 조회
 *
 * Query Params:
 * - year: 연도 (기본값: 올해)
 * - month: 월 (1-12, 기본값: 이번 달)
 *
 * Response:
 * - data: Array of { date, dayOfWeek, isHoliday, holidayName, classes[] }
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const now = new Date();

    const yearParam = searchParams.get('year');
    const monthParam = searchParams.get('month');

    const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
    const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

    // Validate month
    if (month < 1 || month > 12) {
      return NextResponse.json(
        {
          error: '월은 1-12 사이여야 합니다.',
          code: 'INVALID_MONTH',
        },
        { status: 400 }
      );
    }

    const db = readDatabase();

    // Get all days in the month
    const firstDayOfMonth = new Date(year, month - 1, 1);
    const lastDayOfMonth = new Date(year, month, 0);

    const allDaysInMonth = eachDayOfInterval({
      start: firstDayOfMonth,
      end: lastDayOfMonth,
    });

    // Build monthly schedule
    const monthlySchedule = allDaysInMonth.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOfWeek = getDay(date);

      // Check if holiday
      const holiday = db.holidays.find(h => h.date === dateStr);
      const isHoliday = !!holiday;
      const holidayName = holiday?.name;

      // Get classes for this day of week
      const dayClasses = db.classes
        .filter(c => c.status === 'active')
        .filter(c => c.schedule.some(s => s.dayOfWeek === dayOfWeek))
        .flatMap(c => {
          const instructor = db.instructors.find(i => i.id === c.instructorId);
          const enrollmentCount = db.enrollments.filter(
            e => e.classId === c.id && e.status === 'active'
          ).length;

          // Get all schedules for this day
          const daySchedules = c.schedule.filter(s => s.dayOfWeek === dayOfWeek);

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

      return {
        date: dateStr,
        dayOfWeek,
        isHoliday,
        holidayName,
        classes: dayClasses,
      };
    });

    return NextResponse.json({
      data: monthlySchedule,
    });
  } catch (error) {
    console.error('Monthly schedule API error:', error);
    return NextResponse.json(
      {
        error: '월간 시간표를 불러오는 데 실패했습니다.',
        code: 'MONTHLY_SCHEDULE_ERROR',
      },
      { status: 500 }
    );
  }
}
