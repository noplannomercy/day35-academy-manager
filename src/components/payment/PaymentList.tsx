'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Payment, Student, Class } from '@/types';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Eye, Wallet } from 'lucide-react';
import { PayDialog } from './PayDialog';

interface PaymentListProps {
  payments: (Payment & {
    student: Student;
    class: Class;
  })[];
  onPaymentUpdate?: () => void;
}

export function PaymentList({ payments, onPaymentUpdate }: PaymentListProps) {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);

  const handleQuickPay = (payment: Payment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPayment(payment);
    setIsPayDialogOpen(true);
  };

  const handlePaySuccess = () => {
    setIsPayDialogOpen(false);
    setSelectedPayment(null);
    alert('수납이 성공적으로 처리되었습니다.');
    onPaymentUpdate?.();
  };

  const columns = [
    {
      key: 'student',
      label: '학생명',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="font-medium">{payment.student.name}</div>
      ),
    },
    {
      key: 'class',
      label: '반명',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div>{payment.class.name}</div>
      ),
    },
    {
      key: 'month',
      label: '월',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="font-mono">
          {format(new Date(payment.month + '-01'), 'yyyy년 M월', { locale: ko })}
        </div>
      ),
    },
    {
      key: 'amount',
      label: '금액',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="text-right font-medium">
          {payment.amount.toLocaleString()}원
        </div>
      ),
    },
    {
      key: 'paidAmount',
      label: '납부액',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="text-right">
          <span className={payment.paidAmount > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
            {payment.paidAmount.toLocaleString()}원
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <StatusBadge status={payment.status} label={PAYMENT_STATUS_LABELS[payment.status]} />
      ),
    },
    {
      key: 'paidDate',
      label: '납부일',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="text-sm text-gray-600">
          {payment.paidDate ? (
            format(new Date(payment.paidDate), 'yyyy-MM-dd', { locale: ko })
          ) : (
            <span className="text-gray-400">미납</span>
          )}
        </div>
      ),
    },
    {
      key: 'method',
      label: '납부방법',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="text-sm">
          {payment.method ? PAYMENT_METHOD_LABELS[payment.method] : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      label: '액션',
      render: (payment: Payment & { student: Student; class: Class }) => (
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => router.push(`/payments/${payment.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {(payment.status === 'unpaid' || payment.status === 'partial' || payment.status === 'overdue') && (
            <Button
              size="sm"
              variant="default"
              onClick={(e) => handleQuickPay(payment, e)}
            >
              <Wallet className="h-4 w-4 mr-1" />
              납부
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        data={payments}
        columns={columns}
        onRowClick={(payment) => router.push(`/payments/${payment.id}`)}
      />

      {selectedPayment && (
        <PayDialog
          open={isPayDialogOpen}
          onOpenChange={setIsPayDialogOpen}
          payment={selectedPayment}
          onSuccess={handlePaySuccess}
        />
      )}
    </>
  );
}
