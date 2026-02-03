'use client';

import { Refund } from '@/types';
import { DataTable } from '@/components/common/DataTable';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Receipt } from 'lucide-react';

interface RefundListProps {
  refunds: Refund[];
}

export function RefundList({ refunds }: RefundListProps) {
  const totalRefundAmount = refunds.reduce((sum, refund) => sum + refund.amount, 0);

  const columns = [
    {
      key: 'refundDate',
      label: '환불일',
      render: (refund: Refund) => (
        <div className="font-medium">
          {format(new Date(refund.refundDate), 'yyyy-MM-dd', { locale: ko })}
        </div>
      ),
    },
    {
      key: 'amount',
      label: '환불 금액',
      render: (refund: Refund) => (
        <div className="text-right font-bold text-red-600">
          {refund.amount.toLocaleString()}원
        </div>
      ),
    },
    {
      key: 'reason',
      label: '환불 사유',
      render: (refund: Refund) => (
        <div className="text-sm whitespace-pre-wrap max-w-md">{refund.reason}</div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {refunds.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-red-600" />
              <span className="font-medium text-gray-900">총 환불 금액</span>
            </div>
            <span className="text-xl font-bold text-red-600">
              {totalRefundAmount.toLocaleString()}원
            </span>
          </div>
        </div>
      )}

      {refunds.length === 0 ? (
        <div className="text-center py-8 text-gray-500">환불 내역이 없습니다.</div>
      ) : (
        <DataTable data={refunds} columns={columns} />
      )}
    </div>
  );
}
