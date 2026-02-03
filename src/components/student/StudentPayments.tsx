'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/common';

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  status: string;
  paidAt?: string;
}

interface StudentPaymentsProps {
  studentId: string;
}

export default function StudentPayments({ studentId }: StudentPaymentsProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [studentId]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/payments?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (payments.length === 0) {
    return <EmptyState title="수납 내역이 없습니다" />;
  }

  return (
    <div className="space-y-4">
      {payments.map((payment) => (
        <Card key={payment.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{payment.amount.toLocaleString()}원</h3>
                  <StatusBadge status={payment.status} />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  납부 기한: {payment.dueDate}
                </p>
                {payment.paidAt && (
                  <p className="text-sm text-gray-600">
                    납부일: {payment.paidAt}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
