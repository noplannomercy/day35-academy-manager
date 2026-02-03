'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Payment, Student, Class, Refund } from '@/types';
import { Button } from '@/components/ui/button';
import { PaymentDetail } from '@/components/payment/PaymentDetail';
import { PayDialog } from '@/components/payment/PayDialog';
import { RefundList } from '@/components/refund/RefundList';
import { RefundDialog } from '@/components/refund/RefundDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ArrowLeft, Wallet, RotateCcw } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PaymentDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [classData, setClassData] = useState<Class | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false);

  useEffect(() => {
    fetchPaymentDetail();
  }, [resolvedParams.id]);

  const fetchPaymentDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch payment detail
      const paymentResponse = await fetch(`/api/payments/${resolvedParams.id}`);
      const paymentResult = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentResult.error || '수납 정보를 불러오는데 실패했습니다.');
      }

      const paymentData = paymentResult.data;
      setPayment(paymentData);

      // Fetch student
      const studentResponse = await fetch(`/api/students/${paymentData.studentId}`);
      const studentResult = await studentResponse.json();
      if (studentResponse.ok) {
        setStudent(studentResult.data);
      }

      // Fetch class
      const classResponse = await fetch(`/api/classes/${paymentData.classId}`);
      const classResult = await classResponse.json();
      if (classResponse.ok) {
        setClassData(classResult.data);
      }

      // Fetch refunds
      const refundsResponse = await fetch(
        `/api/refunds?paymentId=${resolvedParams.id}`
      );
      const refundsResult = await refundsResponse.json();
      if (refundsResponse.ok) {
        setRefunds(refundsResult.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaySuccess = () => {
    setIsPayDialogOpen(false);
    alert('납부가 성공적으로 처리되었습니다.');
    fetchPaymentDetail();
  };

  const handleRefundSuccess = () => {
    setIsRefundDialogOpen(false);
    alert('환불이 성공적으로 처리되었습니다.');
    fetchPaymentDetail();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !payment || !student || !classData) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/payments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          목록으로
        </Button>
        <ErrorMessage message={error || '수납 정보를 찾을 수 없습니다.'} />
      </div>
    );
  }

  const canPay = payment.status === 'unpaid' || payment.status === 'partial' || payment.status === 'overdue';
  const canRefund = payment.status === 'paid' || payment.status === 'partial';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/payments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            목록으로
          </Button>
          <div>
            <h1 className="text-3xl font-bold">수납 상세</h1>
            <p className="text-gray-600 mt-1">
              {student.name} - {classData.name}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canPay && (
            <Button onClick={() => setIsPayDialogOpen(true)}>
              <Wallet className="h-4 w-4 mr-2" />
              납부 처리
            </Button>
          )}
          {canRefund && (
            <Button variant="destructive" onClick={() => setIsRefundDialogOpen(true)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              환불 처리
            </Button>
          )}
        </div>
      </div>

      {/* Payment Detail */}
      <PaymentDetail payment={payment} student={student} class={classData} />

      {/* Refund List */}
      {refunds.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-4">환불 내역</h2>
          <RefundList refunds={refunds} />
        </div>
      )}

      {/* Pay Dialog */}
      {canPay && (
        <PayDialog
          open={isPayDialogOpen}
          onOpenChange={setIsPayDialogOpen}
          payment={payment}
          onSuccess={handlePaySuccess}
        />
      )}

      {/* Refund Dialog */}
      {canRefund && (
        <RefundDialog
          open={isRefundDialogOpen}
          onOpenChange={setIsRefundDialogOpen}
          payment={payment}
          onSuccess={handleRefundSuccess}
        />
      )}
    </div>
  );
}
