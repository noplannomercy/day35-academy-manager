'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Student, Class } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { SelectField } from '@/components/common/SelectField';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { ProratedCalculator } from './ProratedCalculator';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus } from 'lucide-react';

interface PaymentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  students: Student[];
  classes: Class[];
  onSuccess: () => void;
}

const paymentSchema = z.object({
  studentId: z.string().min(1, '학생을 선택하세요'),
  classId: z.string().min(1, '반을 선택하세요'),
  month: z.string().regex(/^\d{4}-\d{2}$/, '올바른 월 형식이 아닙니다 (YYYY-MM)'),
  amount: z.number().min(0, '금액은 0원 이상이어야 합니다'),
  isProrated: z.boolean(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export function PaymentForm({
  open,
  onOpenChange,
  students,
  classes,
  onSuccess,
}: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProratedCalculator, setShowProratedCalculator] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      studentId: '',
      classId: '',
      month: format(new Date(), 'yyyy-MM'),
      amount: 0,
      isProrated: false,
      notes: '',
    },
  });

  const selectedClassId = watch('classId');
  const isProrated = watch('isProrated');

  // Update amount when class is selected
  useEffect(() => {
    if (selectedClassId && !isProrated) {
      const selectedClass = classes.find((c) => c.id === selectedClassId);
      if (selectedClass) {
        setValue('amount', selectedClass.monthlyFee);
      }
    }
  }, [selectedClassId, classes, isProrated, setValue]);

  const onSubmit = async (data: PaymentFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '수납 등록에 실패했습니다.');
      }

      reset();
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleProratedCalculated = (amount: number) => {
    setValue('amount', amount);
  };

  const activeStudents = students.filter((s) => s.status === 'active');
  const activeClasses = classes.filter((c) => c.status === 'active');

  const studentOptions = activeStudents.map((student) => ({
    value: student.id,
    label: `${student.name} (${student.phone})`,
  }));

  const classOptions = activeClasses.map((cls) => ({
    value: cls.id,
    label: `${cls.name} (${cls.monthlyFee.toLocaleString()}원)`,
  }));

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            수납 등록
          </DialogTitle>
          <DialogDescription>새로운 수납 내역을 등록합니다.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Student Select */}
            <div className="space-y-2">
              <Label>
                학생 <span className="text-red-500">*</span>
              </Label>
              <SelectField
                value={watch('studentId')}
                onChange={(value) => setValue('studentId', value)}
                options={studentOptions}
                placeholder="학생을 선택하세요"
              />
              {errors.studentId && (
                <p className="text-sm text-red-500">{errors.studentId.message}</p>
              )}
            </div>

            {/* Class Select */}
            <div className="space-y-2">
              <Label>
                반 <span className="text-red-500">*</span>
              </Label>
              <SelectField
                value={watch('classId')}
                onChange={(value) => setValue('classId', value)}
                options={classOptions}
                placeholder="반을 선택하세요"
              />
              {errors.classId && (
                <p className="text-sm text-red-500">{errors.classId.message}</p>
              )}
            </div>

            {/* Month Select */}
            <div className="space-y-2">
              <Label>
                월 <span className="text-red-500">*</span>
              </Label>
              <SelectField
                value={watch('month')}
                onChange={(value) => setValue('month', value)}
                options={monthOptions}
                placeholder="월을 선택하세요"
              />
              {errors.month && <p className="text-sm text-red-500">{errors.month.message}</p>}
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                금액 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                {...register('amount', { valueAsNumber: true })}
                disabled={isProrated}
                placeholder="금액을 입력하세요"
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
            </div>
          </div>

          {/* Prorated Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isProrated"
              checked={isProrated}
              onCheckedChange={(checked) => {
                setValue('isProrated', checked as boolean);
                setShowProratedCalculator(checked as boolean);
              }}
            />
            <Label
              htmlFor="isProrated"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              일할계산 적용
            </Label>
          </div>

          {/* Prorated Calculator */}
          {showProratedCalculator && (
            <ProratedCalculator classes={activeClasses} onCalculated={handleProratedCalculated} />
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">메모</Label>
            <textarea
              id="notes"
              {...register('notes')}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="메모를 입력하세요"
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
              disabled={loading}
              className="flex-1"
            >
              취소
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <LoadingSpinner /> : '등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
