'use client';

import { useState, useEffect } from 'react';
import { Payment, Student, Class, Pagination } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/components/common/SelectField';
import { PaymentList } from '@/components/payment/PaymentList';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { UnpaidSummary } from '@/components/payment/UnpaidSummary';
import { Pagination as PaginationComponent } from '@/components/common/Pagination';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ExportButton } from '@/components/export/ExportButton';
import { PAGE_SIZE, PAYMENT_STATUS_LABELS } from '@/lib/constants';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Search, Filter } from 'lucide-react';

type PaymentStatusFilter = 'all' | 'unpaid' | 'partial' | 'paid' | 'overdue';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<(Payment & { student: Student; class: Class })[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  // Filters
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [status, setStatus] = useState<PaymentStatusFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [pagination.page, month, status]);

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: PAGE_SIZE.toString(),
        month,
      });

      if (status !== 'all') {
        params.append('status', status);
      }

      const response = await fetch(`/api/payments?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '수납 목록을 불러오는데 실패했습니다.');
      }

      setPayments(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?limit=1000');
      const result = await response.json();
      if (response.ok) {
        setStudents(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch('/api/classes?limit=1000');
      const result = await response.json();
      if (response.ok) {
        setClasses(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch classes:', err);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchPayments();
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  // Filter payments by search term
  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    return (
      payment.student.name.toLowerCase().includes(lowerSearch) ||
      payment.class.name.toLowerCase().includes(lowerSearch)
    );
  });

  // Month options
  const currentYear = new Date().getFullYear();
  const monthOptions = [];
  for (let year = currentYear - 1; year <= currentYear + 1; year++) {
    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      monthOptions.push({
        value: monthStr,
        label: format(new Date(monthStr + '-01'), 'yyyy년 M월', { locale: ko }),
      });
    }
  }

  const statusOptions = [
    { value: 'all', label: '전체' },
    { value: 'unpaid', label: PAYMENT_STATUS_LABELS.unpaid },
    { value: 'partial', label: PAYMENT_STATUS_LABELS.partial },
    { value: 'paid', label: PAYMENT_STATUS_LABELS.paid },
    { value: 'overdue', label: PAYMENT_STATUS_LABELS.overdue },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">수납 관리</h1>
          <p className="text-gray-600 mt-1">학생별 수강료 납부 내역을 관리합니다</p>
        </div>
        <div className="flex gap-2">
          <ExportButton type="payments" params={{ month, status: status !== 'all' ? status : undefined }} />
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            수납 등록
          </Button>
        </div>
      </div>

      {/* Unpaid Summary */}
      <UnpaidSummary />

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h2 className="font-semibold">필터</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium mb-1 block">월별</label>
            <SelectField
              value={month}
              onChange={setMonth}
              options={monthOptions}
              placeholder="월을 선택하세요"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">상태</label>
            <SelectField
              value={status}
              onChange={(value) => setStatus(value as PaymentStatusFilter)}
              options={statusOptions}
              placeholder="상태를 선택하세요"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="학생명, 반명 검색"
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-6">
            <ErrorMessage message={error} />
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">수납 내역이 없습니다.</div>
        ) : (
          <>
            <PaymentList payments={filteredPayments} onPaymentUpdate={fetchPayments} />
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t">
                <PaginationComponent
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Form Dialog */}
      <PaymentForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        students={students}
        classes={classes}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}
