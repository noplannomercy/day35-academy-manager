'use client';

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ScheduleCell } from './ScheduleCell';
import { DAY_OF_WEEK_LABELS } from '@/lib/constants';
import type { Class, Instructor, Holiday } from '@/types';

interface MonthlyCalendarProps {
  year: number;
  month: number;
  instructorId?: string;
  roomId?: string;
}

interface ScheduleItem {
  class: Class;
  instructor: Instructor;
  subject: { id: string; name: string };
  room?: { id: string; name: string };
  date: string;
  startTime: string;
  endTime: string;
}

export function MonthlyCalendar({
  year: initialYear,
  month: initialMonth,
  instructorId,
  roomId,
}: MonthlyCalendarProps) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          year: year.toString(),
          month: month.toString(),
        });
        if (instructorId) params.append('instructorId', instructorId);
        if (roomId) params.append('roomId', roomId);

        const response = await fetch(`/api/schedule/monthly?${params.toString()}`);

        if (!response.ok) {
          throw new Error('Failed to fetch schedule');
        }

        const data = await response.json();
        setSchedules(data.data.schedules || []);
        setHolidays(data.data.holidays || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [year, month, instructorId, roomId]);

  const currentDate = new Date(year, month - 1);
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => {
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleToday = () => {
    const today = new Date();
    setYear(today.getFullYear());
    setMonth(today.getMonth() + 1);
  };

  const getScheduleForDate = (dateStr: string) => {
    return schedules.filter((s) => s.date === dateStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const isHoliday = (dateStr: string) => {
    return holidays.find((h) => h.date === dateStr);
  };

  if (loading) {
    return <LoadingSpinner size="lg" center />;
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="space-y-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            오늘
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-lg font-semibold">{format(currentDate, 'yyyy년 M월', { locale: ko })}</div>
      </div>

      {/* Calendar Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Day of Week Header */}
        <div className="grid grid-cols-7 bg-muted">
          {DAY_OF_WEEK_LABELS.map((day, index) => (
            <div key={index} className="p-2 text-center font-medium text-sm border-r last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const holiday = isHoliday(dateStr);
            const daySchedules = getScheduleForDate(dateStr);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = dateStr === today;

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-r border-b last:border-r-0 ${
                  !isCurrentMonth ? 'bg-muted/50' : ''
                } ${holiday ? 'bg-red-50' : ''} ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${!isCurrentMonth ? 'text-muted-foreground' : ''} ${
                      isToday ? 'text-blue-600 font-bold' : ''
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {holiday && <span className="text-xs text-red-600 truncate max-w-[80px]">{holiday.name}</span>}
                </div>

                <div className="space-y-1">
                  {daySchedules.slice(0, 3).map((schedule) => (
                    <ScheduleCell
                      key={`${schedule.class.id}-${schedule.startTime}`}
                      class={schedule.class}
                      instructor={schedule.instructor}
                      subject={schedule.subject}
                      room={schedule.room}
                      startTime={schedule.startTime}
                      compact
                    />
                  ))}
                  {daySchedules.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1">+{daySchedules.length - 3}개 더</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {schedules.length === 0 && (
        <EmptyState title="수업이 없습니다" description="이번 달에 등록된 수업이 없습니다." />
      )}
    </div>
  );
}
