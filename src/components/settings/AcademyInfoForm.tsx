'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/common/FormField';
import { TimePicker } from '@/components/common/TimePicker';
import type { Settings } from '@/types';

const academyInfoSchema = z.object({
  academyName: z.string().min(1, '학원명을 입력해주세요.'),
  phone: z.string().min(1, '전화번호를 입력해주세요.'),
  address: z.string().optional(),
  operatingHours: z.object({
    start: z.string().min(1, '운영 시작 시간을 입력해주세요.'),
    end: z.string().min(1, '운영 종료 시간을 입력해주세요.'),
  }),
});

type AcademyInfoFormData = z.infer<typeof academyInfoSchema>;

interface AcademyInfoFormProps {
  settings: Settings | null;
  onUpdate: () => void;
}

export function AcademyInfoForm({ settings, onUpdate }: AcademyInfoFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AcademyInfoFormData>({
    resolver: zodResolver(academyInfoSchema),
    values: settings
      ? {
          academyName: settings.academyName,
          phone: settings.phone,
          address: settings.address || '',
          operatingHours: {
            start: settings.operatingHours.start,
            end: settings.operatingHours.end,
          },
        }
      : undefined,
  });

  const operatingStart = watch('operatingHours.start');
  const operatingEnd = watch('operatingHours.end');

  const onSubmit = async (data: AcademyInfoFormData) => {
    setLoading(true);

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '설정 저장에 실패했습니다.');
      }

      toast.success(result.message || '학원 정보가 저장되었습니다.');
      onUpdate();
    } catch (error) {
      console.error('Academy info update error:', error);
      toast.error(
        error instanceof Error ? error.message : '학원 정보 저장에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>학원 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            label="학원명"
            error={errors.academyName?.message}
            required
            htmlFor="academyName"
          >
            <Input
              id="academyName"
              {...register('academyName')}
              placeholder="학원명을 입력하세요"
            />
          </FormField>

          <FormField
            label="전화번호"
            error={errors.phone?.message}
            required
            htmlFor="phone"
          >
            <Input
              id="phone"
              {...register('phone')}
              placeholder="010-1234-5678"
            />
          </FormField>

          <FormField
            label="주소"
            error={errors.address?.message}
            htmlFor="address"
          >
            <Input
              id="address"
              {...register('address')}
              placeholder="학원 주소를 입력하세요"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="운영 시작 시간"
              error={errors.operatingHours?.start?.message}
              required
            >
              <TimePicker
                value={operatingStart}
                onChange={(value) => setValue('operatingHours.start', value)}
                placeholder="09:00"
              />
            </FormField>

            <FormField
              label="운영 종료 시간"
              error={errors.operatingHours?.end?.message}
              required
            >
              <TimePicker
                value={operatingEnd}
                onChange={(value) => setValue('operatingHours.end', value)}
                placeholder="22:00"
              />
            </FormField>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? '저장 중...' : '저장'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
