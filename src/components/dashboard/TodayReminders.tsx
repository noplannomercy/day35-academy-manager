'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Consultation, Student } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TodayRemindersProps {
  data: {
    consultation: Consultation;
    student: Student;
  }[];
}

const consultationTypeLabels: Record<string, string> = {
  phone: '전화상담',
  visit: '방문상담',
  online: '온라인상담',
};

export function TodayReminders({ data }: TodayRemindersProps) {
  const router = useRouter();

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오늘 리마인더</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            오늘 예정된 리마인더가 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>오늘 리마인더</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.consultation.id}
              className="flex items-start justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push(`/students/${item.student.id}`)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium">{item.student.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {consultationTypeLabels[item.consultation.type] || item.consultation.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.consultation.nextAction}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(item.consultation.date), 'M/d', { locale: ko })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
