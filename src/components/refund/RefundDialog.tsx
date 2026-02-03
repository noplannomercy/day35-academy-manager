'use client';

import { Payment } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefundForm } from './RefundForm';
import { RotateCcw } from 'lucide-react';

interface RefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onSuccess: () => void;
}

export function RefundDialog({ open, onOpenChange, payment, onSuccess }: RefundDialogProps) {
  const handleSuccess = () => {
    onSuccess();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            환불 처리
          </DialogTitle>
          <DialogDescription>환불 금액과 사유를 입력하세요.</DialogDescription>
        </DialogHeader>

        <RefundForm
          payment={payment}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
