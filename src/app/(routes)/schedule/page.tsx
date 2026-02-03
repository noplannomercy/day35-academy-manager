'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WeeklySchedule } from '@/components/schedule/WeeklySchedule';
import { MonthlyCalendar } from '@/components/schedule/MonthlyCalendar';
import { ScheduleFilter } from '@/components/schedule/ScheduleFilter';

export default function SchedulePage() {
  const [view, setView] = useState<'weekly' | 'monthly'>('weekly');
  const [instructorId, setInstructorId] = useState<string | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            시간표
          </h1>
          <p className="text-muted-foreground mt-1">주간 및 월간 수업 시간표를 확인하세요</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
          <CardDescription>강사 또는 강의실별로 시간표를 필터링할 수 있습니다</CardDescription>
        </CardHeader>
        <CardContent>
          <ScheduleFilter
            instructorId={instructorId}
            roomId={roomId}
            onInstructorChange={setInstructorId}
            onRoomChange={setRoomId}
          />
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as 'weekly' | 'monthly')}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="weekly">주간</TabsTrigger>
          <TabsTrigger value="monthly">월간</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <WeeklySchedule
                date={format(currentDate, 'yyyy-MM-dd')}
                instructorId={instructorId}
                roomId={roomId}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <MonthlyCalendar year={currentYear} month={currentMonth} instructorId={instructorId} roomId={roomId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
