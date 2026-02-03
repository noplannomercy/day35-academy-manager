'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Student, Class, Payment } from '@/types';

interface UnpaidListProps {
  data: {
    payment: Payment;
    student: Student;
    class: Class;
    daysOverdue?: number;
  }[];
  limit?: number;
  onViewAll?: () => void;
}

export function UnpaidList({ data, limit = 10, onViewAll }: UnpaidListProps) {
  const router = useRouter();
  const displayData = data.slice(0, limit);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>미납자 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            미납 내역이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>미납자 목록</CardTitle>
        {onViewAll && data.length > limit && (
          <Button variant="ghost" size="sm" onClick={onViewAll}>
            전체 보기
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayData.map((item) => (
            <div
              key={item.payment.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
              onClick={() => router.push(`/students/${item.student.id}`)}
            >
              <div className="flex-1">
                <p className="font-medium">{item.student.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.class.name} · {item.payment.month}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {item.payment.amount.toLocaleString()}원
                </p>
                {item.daysOverdue !== undefined && item.daysOverdue > 0 && (
                  <p className="text-sm text-red-600">
                    {item.daysOverdue}일 연체
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
