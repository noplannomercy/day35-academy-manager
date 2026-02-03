'use client';

import { useState, useEffect } from 'react';
import { Holiday } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import HolidayList from '@/components/holiday/HolidayList';
import HolidayForm from '@/components/holiday/HolidayForm';
import PublicHolidayInit from '@/components/holiday/PublicHolidayInit';
import { toast } from 'sonner';

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [isFormOpen, setIsFormOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  const fetchHolidays = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/holidays?year=${year}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '휴일 조회 실패');
      }

      setHolidays(result.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : '휴일 조회 실패';
      toast.error(message);
      setHolidays([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, [year]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">휴일 관리</h1>
        <p className="text-muted-foreground mt-2">
          휴일을 관리하고 공휴일을 자동으로 등록합니다
        </p>
      </div>

      {/* Public Holiday Init */}
      <PublicHolidayInit onSuccess={fetchHolidays} />

      {/* Filters & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">연도</label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
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
          <div className="text-sm text-muted-foreground">
            총 {holidays.length}개의 휴일
          </div>
        </div>

        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          휴일 등록
        </Button>
      </div>

      {/* Holiday List */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
      ) : (
        <HolidayList holidays={holidays} onRefresh={fetchHolidays} />
      )}

      {/* Holiday Form Dialog */}
      <HolidayForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchHolidays}
      />
    </div>
  );
}
