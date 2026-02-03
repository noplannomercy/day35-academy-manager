'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { InstructorSalary } from '@/types';

interface SalaryPayDialogProps {
  salary: InstructorSalary;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SalaryPayDialog({
  salary,
  onClose,
  onSuccess,
}: SalaryPayDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePay = async () => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/instructor-salaries/${salary.id}/pay`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paidDate: new Date().toISOString().slice(0, 10),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '지급 처리에 실패했습니다.');
      }

      toast.success('급여가 지급 처리되었습니다.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '지급 처리 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>급여 지급</DialogTitle>
          <DialogDescription>급여를 지급 처리하시겠습니까?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">월</span>
              <span className="font-semibold">
                {format(new Date(salary.month + '-01'), 'yyyy년 MM월')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">금액</span>
              <span className="font-semibold text-lg">
                {salary.amount.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            취소
          </Button>
          <Button onClick={handlePay} disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '지급 처리'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
