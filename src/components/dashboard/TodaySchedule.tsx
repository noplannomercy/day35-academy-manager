'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Class, Instructor, Subject, Room } from '@/types';

interface TodayScheduleProps {
  data: {
    class: Class;
    instructor: Instructor;
    subject: Subject;
    room?: Room;
    startTime: string;
    endTime: string;
  }[];
  isHoliday?: boolean;
  holidayName?: string;
}

export function TodaySchedule({ data, isHoliday, holidayName }: TodayScheduleProps) {
  const router = useRouter();

  if (isHoliday) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘 시간표</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-lg font-semibold text-muted-foreground">
              오늘은 휴일입니다
            </p>
            {holidayName && (
              <p className="text-sm text-muted-foreground mt-2">
                {holidayName}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘 시간표</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            오늘 예정된 수업이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  // 시간 순으로 정렬
  const sortedData = [...data].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘 시간표</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedData.map((item, index) => (
            <div
              key={`${item.class.id}-${index}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push(`/classes/${item.class.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{item.class.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {item.subject.name}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {item.instructor.name}
                  {item.room && ` · ${item.room.name}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {item.startTime} - {item.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
