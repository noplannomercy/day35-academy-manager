'use client';

import { useState } from 'react';
import { Waitlist } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';

interface EnrollDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waitlist: Waitlist;
  studentName: string;
  onSuccess: () => void;
}

export default function EnrollDialog({
  open,
  onOpenChange,
  waitlist,
  studentName,
  onSuccess,
}: EnrollDialogProps) {
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    try {
      const response = await fetch(`/api/waitlist/${waitlist.id}/enroll`, {
        method: 'PATCH',
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'CLASS_FULL') {
          throw new Error('정원이 가득 차서 수강 전환할 수 없습니다');
        }
        if (result.code === 'STUDENT_INACTIVE') {
          throw new Error('비활성 학생은 수강 전환할 수 없습니다');
        }
        if (result.code === 'SCHEDULE_CONFLICT') {
          throw new Error('다른 수업과 시간이 중복됩니다');
        }
        throw new Error(result.error || '수강 전환 실패');
      }

      toast.success('수강생으로 전환되었습니다');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '수강 전환 실패';
      toast.error(message);
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            수강생 전환
          </DialogTitle>
          <DialogDescription>
            대기자를 수강생으로 전환합니다
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">학생명</span>
              <span className="font-medium">{studentName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">우선순위</span>
              <span className="font-medium">{waitlist.priority}</span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              이 작업은 정원 여유를 확인하고 수강생으로 등록합니다.
              시간표 충돌이 있는 경우 실패할 수 있습니다.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isEnrolling}
          >
            취소
          </Button>
          <Button onClick={handleEnroll} disabled={isEnrolling}>
            {isEnrolling ? '전환 중...' : '수강생 전환'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
