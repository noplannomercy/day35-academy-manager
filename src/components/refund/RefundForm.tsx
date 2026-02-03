'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Payment } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { RotateCcw } from 'lucide-react';

interface RefundFormProps {
  payment: Payment;
  onSuccess: () => void;
  onCancel: () => void;
}

const refundSchema = z.object({
  amount: z.number().min(1, '환불 금액은 1원 이상이어야 합니다'),
  reason: z.string().min(1, '환불 사유를 입력하세요'),
});

type RefundFormData = z.infer<typeof refundSchema>;

export function RefundForm({ payment, onSuccess, onCancel }: RefundFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxRefundAmount = payment.paidAmount;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RefundFormData>({
    resolver: zodResolver(
      refundSchema.refine((data) => data.amount <= maxRefundAmount, {
        message: `환불 금액은 납부액(${maxRefundAmount.toLocaleString()}원) 이하여야 합니다`,
        path: ['amount'],
      })
    ),
    defaultValues: {
      amount: 0,
      reason: '',
    },
  });

  const onSubmit = async (data: RefundFormData) => {
    if (payment.status === 'unpaid') {
      setError('미납 상태에서는 환불이 불가능합니다.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/refunds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId: payment.id,
          ...data,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '환불 등록에 실패했습니다.');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Payment Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">납부액</span>
          <span className="font-medium text-green-600">
            {payment.paidAmount.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">환불 가능액</span>
          <span className="font-bold text-gray-900">
            {maxRefundAmount.toLocaleString()}원
          </span>
        </div>
      </div>

      {/* Refund Amount */}
      <div className="space-y-2">
        <Label htmlFor="amount">
          환불 금액 <span className="text-red-500">*</span>
        </Label>
        <Input
          id="amount"
          type="number"
          {...register('amount', { valueAsNumber: true })}
          placeholder="환불 금액을 입력하세요"
          max={maxRefundAmount}
        />
        {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
      </div>

      {/* Refund Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">
          환불 사유 <span className="text-red-500">*</span>
        </Label>
        <textarea
          id="reason"
          {...register('reason')}
          rows={4}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="환불 사유를 입력하세요"
        />
        {errors.reason && <p className="text-sm text-red-500">{errors.reason.message}</p>}
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          취소
        </Button>
        <Button type="submit" disabled={loading} variant="destructive" className="flex-1">
          {loading ? <LoadingSpinner /> : (
            <>
              <RotateCcw className="h-4 w-4 mr-2" />
              환불 처리
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
