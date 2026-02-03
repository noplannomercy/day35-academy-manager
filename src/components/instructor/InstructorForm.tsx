'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { FormField, LoadingSpinner } from '@/components/common';
import type { Instructor, Subject } from '@/types';

const instructorSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().min(1, '전화번호를 입력하세요'),
  email: z.string().email('올바른 이메일을 입력하세요').optional().or(z.literal('')),
  subjectIds: z.array(z.string()).min(1, '최소 1개 이상의 과목을 선택하세요'),
  monthlySalary: z.number().min(0, '급여는 0 이상이어야 합니다').optional(),
  status: z.enum(['active', 'inactive']),
  notes: z.string().optional(),
});

type InstructorFormData = z.infer<typeof instructorSchema>;

interface InstructorFormProps {
  initialData?: Instructor;
  onSubmit: (data: InstructorFormData) => Promise<void>;
  onCancel: () => void;
}

export default function InstructorForm({
  initialData,
  onSubmit,
  onCancel,
}: InstructorFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InstructorFormData>({
    resolver: zodResolver(instructorSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          phone: initialData.phone,
          email: initialData.email || '',
          subjectIds: initialData.subjectIds,
          monthlySalary: initialData.monthlySalary || 0,
          status: initialData.status,
          notes: initialData.notes || '',
        }
      : {
          name: '',
          phone: '',
          email: '',
          subjectIds: [],
          monthlySalary: 0,
          status: 'active',
          notes: '',
        },
  });

  const selectedSubjectIds = watch('subjectIds') || [];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSubjects(data.data.subjects || []);
      }
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    const current = selectedSubjectIds;
    const updated = current.includes(subjectId)
      ? current.filter((id) => id !== subjectId)
      : [...current, subjectId];
    setValue('subjectIds', updated);
  };

  const onSubmitForm = async (data: InstructorFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <FormField label="이름" required error={errors.name?.message}>
        <Input {...register('name')} placeholder="강사 이름" />
      </FormField>

      <FormField label="전화번호" required error={errors.phone?.message}>
        <Input {...register('phone')} placeholder="010-1234-5678" />
      </FormField>

      <FormField label="이메일" error={errors.email?.message}>
        <Input {...register('email')} type="email" placeholder="email@example.com" />
      </FormField>

      <FormField label="담당 과목" required error={errors.subjectIds?.message}>
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div key={subject.id} className="flex items-center space-x-2">
              <Checkbox
                id={subject.id}
                checked={selectedSubjectIds.includes(subject.id)}
                onCheckedChange={() => handleSubjectToggle(subject.id)}
              />
              <label htmlFor={subject.id} className="text-sm cursor-pointer">
                {subject.name}
              </label>
            </div>
          ))}
        </div>
      </FormField>

      <FormField label="월 급여" error={errors.monthlySalary?.message}>
        <Input
          {...register('monthlySalary', { valueAsNumber: true })}
          type="number"
          placeholder="3000000"
        />
      </FormField>

      <FormField label="상태" required>
        <select {...register('status')} className="w-full border rounded-md p-2">
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
        </select>
      </FormField>

      <FormField label="메모" error={errors.notes?.message}>
        <textarea
          {...register('notes')}
          className="w-full border rounded-md p-2"
          rows={3}
          placeholder="추가 정보"
        />
      </FormField>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : '저장'}
        </Button>
      </div>
    </form>
  );
}
