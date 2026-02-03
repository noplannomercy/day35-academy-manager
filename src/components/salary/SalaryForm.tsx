'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, LoadingSpinner } from '@/components/common';
import { toast } from 'sonner';
import type { Instructor } from '@/types';

const salarySchema = z.object({
  instructorId: z.string().min(1, '강사를 선택하세요'),
  month: z.string().regex(/^\d{4}-\d{2}$/, 'YYYY-MM 형식으로 입력하세요'),
  amount: z.number().min(0, '금액은 0 이상이어야 합니다'),
});

type SalaryFormData = z.infer<typeof salarySchema>;

interface SalaryFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SalaryForm({ open, onClose, onSuccess }: SalaryFormProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SalaryFormData>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      instructorId: '',
      month: new Date().toISOString().slice(0, 7),
      amount: 0,
    },
  });

  useEffect(() => {
    if (open) {
      fetchInstructors();
    }
  }, [open]);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors');
      if (response.ok) {
        const data = await response.json();
        const instructorList = data.data.map((item: any) => item.instructor);
        setInstructors(instructorList.filter((i: Instructor) => i.status === 'active'));
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: SalaryFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/instructor-salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '등록에 실패했습니다.');
      }

      toast.success('급여가 등록되었습니다.');
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>급여 등록</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="강사" required error={errors.instructorId?.message}>
              <select
                {...register('instructorId')}
                className="w-full border rounded-md p-2"
              >
                <option value="">선택하세요</option>
                {instructors.map((instructor) => (
                  <option key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="월" required error={errors.month?.message}>
              <Input {...register('month')} type="month" />
            </FormField>

            <FormField label="금액" required error={errors.amount?.message}>
              <Input
                {...register('amount', { valueAsNumber: true })}
                type="number"
                placeholder="3000000"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '등록 중...' : '등록'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
