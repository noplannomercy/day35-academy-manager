'use client';

import { useEffect, useState } from 'react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { ScheduleCell } from './ScheduleCell';
import { DAY_OF_WEEK_LABELS } from '@/lib/constants';
import type { Class, Instructor, Holiday } from '@/types';

interface WeeklyScheduleProps {
  date?: string;
  instructorId?: string;
  roomId?: string;
}

interface ScheduleItem {
  class: Class;
  instructor: Instructor;
  subject: { id: string; name: string };
  room?: { id: string; name: string };
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export function WeeklySchedule({ date = format(new Date(), 'yyyy-MM-dd'), instructorId, roomId }: WeeklyScheduleProps) {
  const [currentDate, setCurrentDate] = useState(date);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentDate(date);
  }, [date]);

  useEffect(() => {
    const fetchSchedule = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({ date: currentDate });
        if (instructorId) params.append('instructorId', instructorId);
        if (roomId) params.append('roomId', roomId);

        const response = await fetch(`/api/schedule/weekly?${params.toString()}`);

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
  }, [currentDate, instructorId, roomId]);

  const weekStart = startOfWeek(parseISO(currentDate), { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    setCurrentDate(format(addDays(parseISO(currentDate), -7), 'yyyy-MM-dd'));
  };

  const handleNextWeek = () => {
    setCurrentDate(format(addDays(parseISO(currentDate), 7), 'yyyy-MM-dd'));
  };

  const handleToday = () => {
    setCurrentDate(format(new Date(), 'yyyy-MM-dd'));
  };

  const getScheduleForDay = (dayOfWeek: number) => {
    return schedules.filter((s) => s.dayOfWeek === dayOfWeek).sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const isHoliday = (dateStr: string) => {
    return holidays.some((h) => h.date === dateStr);
  };

  const timeSlots = Array.from({ length: 13 }, (_, i) => `${(9 + i).toString().padStart(2, '0')}:00`);

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

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevWeek}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            오늘
          </Button>
          <Button variant="outline" size="sm" onClick={handleNextWeek}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="text-lg font-semibold">
          {format(weekDays[0], 'yyyy년 M월 d일', { locale: ko })} -{' '}
          {format(weekDays[6], 'yyyy년 M월 d일', { locale: ko })}
        </div>
      </div>

      {/* Weekly Grid */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-8 bg-muted">
          <div className="p-3 border-r font-medium text-sm">시간</div>
          {weekDays.map((day, index) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const holiday = holidays.find((h) => h.date === dateStr);
            const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');

            return (
              <div
                key={index}
                className={`p-3 border-r last:border-r-0 text-center ${
                  isToday ? 'bg-blue-50 font-bold' : ''
                } ${holiday ? 'bg-red-50' : ''}`}
              >
                <div className="text-xs text-muted-foreground">{DAY_OF_WEEK_LABELS[(index + 1) % 7]}</div>
                <div className="text-sm font-medium">{format(day, 'M/d', { locale: ko })}</div>
                {holiday && <div className="text-xs text-red-600 truncate">{holiday.name}</div>}
              </div>
            );
          })}
        </div>

        {/* Time Slots */}
        <div className="divide-y">
          {timeSlots.map((time) => (
            <div key={time} className="grid grid-cols-8">
              <div className="p-2 border-r bg-muted text-sm text-center font-medium">{time}</div>
              {weekDays.map((day, index) => {
                const dayOfWeek = (index + 1) % 7;
                const dateStr = format(day, 'yyyy-MM-dd');
                const holiday = holidays.find((h) => h.date === dateStr);
                const daySchedules = getScheduleForDay(dayOfWeek).filter((s) => s.startTime === time);

                return (
                  <div
                    key={index}
                    className={`p-1 border-r last:border-r-0 min-h-[60px] ${holiday ? 'bg-red-50/50' : ''}`}
                  >
                    {daySchedules.map((schedule) => (
                      <div key={schedule.class.id} className="mb-1 last:mb-0">
                        <ScheduleCell
                          class={schedule.class}
                          instructor={schedule.instructor}
                          subject={schedule.subject}
                          room={schedule.room}
                          startTime={schedule.startTime}
                          endTime={schedule.endTime}
                          compact
                        />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {schedules.length === 0 && (
        <EmptyState title="수업이 없습니다" description="이번 주에 등록된 수업이 없습니다." />
      )}
    </div>
  );
}
