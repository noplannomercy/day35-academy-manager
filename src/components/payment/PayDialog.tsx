'use client';

import { useState } from 'react';
import { Payment, PaymentMethod } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SelectField } from '@/components/common/SelectField';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { PAYMENT_METHOD_LABELS, PARTIAL_PAYMENT_RATIO } from '@/lib/constants';
import { Wallet, CreditCard } from 'lucide-react';

interface PayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment;
  onSuccess: () => void;
}

type PayType = 'full' | 'half';

export function PayDialog({ open, onOpenChange, payment, onSuccess }: PayDialogProps) {
  const [payType, setPayType] = useState<PayType>('full');
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remainingAmount = payment.amount - payment.paidAmount;
  const halfAmount = Math.round(payment.amount * PARTIAL_PAYMENT_RATIO);
  const payAmount = payType === 'full' ? remainingAmount : halfAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/payments/${payment.id}/pay`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payType,
          method,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '납부 처리에 실패했습니다.');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const methodOptions = Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            납부 처리
          </DialogTitle>
          <DialogDescription>
            납부 방식과 납부 방법을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">전체 금액</span>
              <span className="font-medium">{payment.amount.toLocaleString()}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">기 납부액</span>
              <span className="font-medium text-green-600">
                {payment.paidAmount.toLocaleString()}원
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-medium">잔액</span>
              <span className="font-bold text-orange-600">
                {remainingAmount.toLocaleString()}원
              </span>
            </div>
          </div>

          {/* Pay Type */}
          <div className="space-y-3">
            <Label>납부 방식</Label>
            <RadioGroup value={payType} onValueChange={(value) => setPayType(value as PayType)}>
              <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="full" id="full" />
                <Label htmlFor="full" className="flex-1 cursor-pointer">
                  <div className="font-medium">전액 납부</div>
                  <div className="text-sm text-gray-600">
                    {remainingAmount.toLocaleString()}원
                  </div>
                </Label>
              </div>
              {payment.paidAmount === 0 && (
                <div className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <RadioGroupItem value="half" id="half" />
                  <Label htmlFor="half" className="flex-1 cursor-pointer">
                    <div className="font-medium">반액 납부 (50%)</div>
                    <div className="text-sm text-gray-600">
                      {halfAmount.toLocaleString()}원
                    </div>
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>납부 방법</Label>
            <SelectField
              value={method}
              onChange={(value) => setMethod(value as PaymentMethod)}
              options={methodOptions}
            />
          </div>

          {/* Pay Amount Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-gray-900">납부 금액</span>
              </div>
              <span className="text-xl font-bold text-blue-600">
                {payAmount.toLocaleString()}원
              </span>
            </div>
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <LoadingSpinner /> : '납부 처리'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
