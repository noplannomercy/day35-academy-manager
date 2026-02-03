'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, DatePicker, LoadingSpinner } from '@/components/common';
import type { Student, Level, Source } from '@/types';

const studentSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().min(1, '전화번호를 입력하세요'),
  parentPhone: z.string().optional(),
  email: z.string().email('올바른 이메일을 입력하세요').optional().or(z.literal('')),
  birthDate: z.string().optional(),
  levelId: z.string().optional(),
  sourceId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'withdrawn']),
  enrollDate: z.string().min(1, '등록일을 입력하세요'),
  notes: z.string().optional(),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  initialData?: Student;
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
}

export default function StudentForm({
  initialData,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData || {
      name: '',
      phone: '',
      parentPhone: '',
      email: '',
      birthDate: '',
      levelId: '',
      sourceId: '',
      status: 'active',
      enrollDate: new Date().toISOString().slice(0, 10),
      notes: '',
    },
  });

  const enrollDate = watch('enrollDate');
  const birthDate = watch('birthDate');

  useEffect(() => {
    fetchMasterData();
  }, []);

  const fetchMasterData = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setLevels(data.data.levels || []);
        setSources(data.data.sources || []);
      }
    } catch (error) {
      console.error('Failed to fetch master data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitForm = async (data: StudentFormData) => {
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
      <div className="grid grid-cols-2 gap-4">
        <FormField label="이름" required error={errors.name?.message}>
          <Input {...register('name')} placeholder="학생 이름" />
        </FormField>

        <FormField label="전화번호" required error={errors.phone?.message}>
          <Input {...register('phone')} placeholder="010-1234-5678" />
        </FormField>

        <FormField label="학부모 전화번호" error={errors.parentPhone?.message}>
          <Input {...register('parentPhone')} placeholder="010-1234-5678" />
        </FormField>

        <FormField label="이메일" error={errors.email?.message}>
          <Input {...register('email')} type="email" placeholder="email@example.com" />
        </FormField>

        <FormField label="생년월일" error={errors.birthDate?.message}>
          <DatePicker
            value={birthDate ? new Date(birthDate) : undefined}
            onChange={(date) => setValue('birthDate', date ? date.toISOString().slice(0, 10) : '')}
          />
        </FormField>

        <FormField label="등록일" required error={errors.enrollDate?.message}>
          <DatePicker
            value={enrollDate ? new Date(enrollDate) : undefined}
            onChange={(date) => setValue('enrollDate', date ? date.toISOString().slice(0, 10) : '')}
          />
        </FormField>

        <FormField label="등급" error={errors.levelId?.message}>
          <select {...register('levelId')} className="w-full border rounded-md p-2">
            <option value="">선택하세요</option>
            {levels.map((level) => (
              <option key={level.id} value={level.id}>
                {level.name}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="등록경로" error={errors.sourceId?.message}>
          <select {...register('sourceId')} className="w-full border rounded-md p-2">
            <option value="">선택하세요</option>
            {sources.map((source) => (
              <option key={source.id} value={source.id}>
                {source.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <FormField label="상태" required>
        <select {...register('status')} className="w-full border rounded-md p-2">
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="withdrawn">탈퇴</option>
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
