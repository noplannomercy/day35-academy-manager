'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

interface PublicHolidayInitProps {
  onSuccess: () => void;
}

export default function PublicHolidayInit({ onSuccess }: PublicHolidayInitProps) {
  const [year, setYear] = useState('2026');
  const [isLoading, setIsLoading] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  const handleInit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/holidays/init-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: parseInt(year) }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '공휴일 등록 실패');
      }

      const count = result.data?.count || 0;
      toast.success(`${count}개의 공휴일이 등록되었습니다`);
      onSuccess();
    } catch (error) {
      const message = error instanceof Error ? error.message : '공휴일 등록 실패';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>공휴일 자동 등록</CardTitle>
        <CardDescription>
          한국 공휴일을 자동으로 등록합니다. 이미 등록된 날짜는 건너뜁니다.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-4">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">연도 선택</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="연도 선택" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}년
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleInit} disabled={isLoading}>
            <Download className="mr-2 h-4 w-4" />
            {isLoading ? '등록 중...' : '공휴일 자동 등록'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
