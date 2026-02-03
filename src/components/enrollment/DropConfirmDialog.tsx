'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Enrollment {
  id: string;
  studentId: string;
  student: { id: string; name: string };
  status: string;
  enrollmentDate: string;
}

interface DropConfirmDialogProps {
  enrollment: Enrollment;
  onConfirm: (refundAmount: number) => void;
  onCancel: () => void;
}

export default function DropConfirmDialog({
  enrollment,
  onConfirm,
  onCancel,
}: DropConfirmDialogProps) {
  const [refundAmount, setRefundAmount] = useState(0);

  const handleConfirm = () => {
    onConfirm(refundAmount);
  };

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>수강 취소 확인</DialogTitle>
          <DialogDescription>
            {enrollment.student.name} 학생의 수강을 취소하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refundAmount">환불 금액 (원)</Label>
            <Input
              id="refundAmount"
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(Number(e.target.value))}
              min="0"
            />
            <p className="text-sm text-muted-foreground">
              환불 금액을 입력하세요. 환불이 없으면 0을 입력하세요.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirm}>
              수강 취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
