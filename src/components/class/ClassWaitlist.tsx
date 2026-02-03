'use client';

import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { toast } from 'sonner';

interface WaitlistItem {
  id: string;
  studentId: string;
  student: { id: string; name: string };
  status: string;
  priority: number;
  requestDate: string;
}

interface ClassWaitlistProps {
  classId: string;
  waitlist: WaitlistItem[];
  onRefresh: () => void;
}

export default function ClassWaitlist({
  classId,
  waitlist,
  onRefresh,
}: ClassWaitlistProps) {
  const handleEnroll = async (waitlistId: string) => {
    try {
      const response = await fetch(`/api/waitlist/${waitlistId}/enroll`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '수강 등록에 실패했습니다.');
      }

      toast.success('수강 등록이 완료되었습니다.');
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다.');
    }
  };

  const handleCancel = async (waitlistId: string) => {
    if (!confirm('대기 신청을 취소하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/waitlist/${waitlistId}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '취소에 실패했습니다.');
      }

      toast.success('대기 신청이 취소되었습니다.');
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다.');
    }
  };

  const sortedWaitlist = [...waitlist].sort((a, b) => a.priority - b.priority);

  return (
    <Card>
      <CardHeader>
        <CardTitle>대기자 목록</CardTitle>
      </CardHeader>
      <CardContent>
        {waitlist.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            대기자가 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {sortedWaitlist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-muted-foreground w-8">
                    {item.priority}
                  </div>
                  <div>
                    <p className="font-medium">{item.student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      신청일: {item.requestDate}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                {item.status === 'waiting' && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleEnroll(item.id)}
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      수강 등록
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(item.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      취소
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
