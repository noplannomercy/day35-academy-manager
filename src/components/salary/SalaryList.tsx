'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, EmptyState, Pagination } from '@/components/common';
import SalaryPayDialog from './SalaryPayDialog';
import type { InstructorSalary } from '@/types';

interface SalaryListProps {
  salaries: InstructorSalary[];
  onPaymentComplete: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function SalaryList({
  salaries,
  onPaymentComplete,
  currentPage,
  totalPages,
  onPageChange,
}: SalaryListProps) {
  const [selectedSalary, setSelectedSalary] = useState<InstructorSalary | null>(null);

  if (salaries.length === 0) {
    return <EmptyState title="등록된 급여 내역이 없습니다" />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-4">
          {salaries.map((salary) => (
            <div
              key={salary.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">
                    {format(new Date(salary.month + '-01'), 'yyyy년 MM월')}
                  </h3>
                  <StatusBadge status={salary.status} />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <div>강사 ID: {salary.instructorId}</div>
                  <div className="font-semibold text-lg mt-1">
                    {salary.amount.toLocaleString()}원
                  </div>
                  {salary.paidDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      지급일: {salary.paidDate}
                    </div>
                  )}
                </div>
              </div>
              {salary.status === 'unpaid' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSalary(salary)}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  지급
                </Button>
              )}
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {selectedSalary && (
        <SalaryPayDialog
          salary={selectedSalary}
          onClose={() => setSelectedSalary(null)}
          onSuccess={() => {
            setSelectedSalary(null);
            onPaymentComplete();
          }}
        />
      )}
    </>
  );
}
