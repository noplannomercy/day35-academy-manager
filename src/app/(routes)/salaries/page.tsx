'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import SalaryList from '@/components/salary/SalaryList';
import SalaryForm from '@/components/salary/SalaryForm';
import SalarySummary from '@/components/salary/SalarySummary';
import type { InstructorSalary } from '@/types';

interface SalaryWithInstructor {
  salary: InstructorSalary;
  instructor: {
    id: string;
    name: string;
    phone: string;
  };
}

interface SalariesResponse {
  data: SalaryWithInstructor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function SalariesPage() {
  const [salaries, setSalaries] = useState<InstructorSalary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSalaries();
  }, [currentPage]);

  const fetchSalaries = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/instructor-salaries?page=${currentPage}&limit=10`);

      if (!response.ok) {
        throw new Error('급여 목록을 불러오는데 실패했습니다.');
      }

      const data: SalariesResponse = await response.json();
      setSalaries(data.data.map(item => item.salary));
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={fetchSalaries} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">급여 관리</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          급여 등록
        </Button>
      </div>

      <SalarySummary />

      <Card>
        <CardHeader>
          <CardTitle>급여 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <SalaryList
            salaries={salaries}
            onPaymentComplete={fetchSalaries}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {showForm && (
        <SalaryForm
          open={showForm}
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchSalaries();
          }}
        />
      )}
    </div>
  );
}
