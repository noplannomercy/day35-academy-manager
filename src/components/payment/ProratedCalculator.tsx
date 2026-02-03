'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SelectField } from '@/components/common/SelectField';
import { DatePicker } from '@/components/common/DatePicker';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Class } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Calculator } from 'lucide-react';

interface ProratedCalculatorProps {
  classes: Class[];
  onCalculated?: (amount: number) => void;
}

interface ProratedResult {
  originalAmount: number;
  proratedAmount: number;
  totalClassDays: number;
  remainingClassDays: number;
  calculation: string;
}

export function ProratedCalculator({ classes, onCalculated }: ProratedCalculatorProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [enrollDate, setEnrollDate] = useState<Date | undefined>(undefined);
  const [month, setMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [result, setResult] = useState<ProratedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClassId && enrollDate && month) {
      calculateProrated();
    } else {
      setResult(null);
      setError(null);
    }
  }, [selectedClassId, enrollDate, month]);

  const calculateProrated = async () => {
    if (!selectedClassId || !enrollDate || !month) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/payments/calculate-prorated', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          classId: selectedClassId,
          enrollDate: format(enrollDate, 'yyyy-MM-dd'),
          month,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '일할계산에 실패했습니다.');
      }

      setResult(data.data);
      onCalculated?.(data.data.proratedAmount);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const classOptions = classes.map((cls) => ({
    value: cls.id,
    label: cls.name,
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          일할계산
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <Label>반 선택</Label>
            <SelectField
              value={selectedClassId}
              onChange={setSelectedClassId}
              options={classOptions}
              placeholder="반을 선택하세요"
            />
          </div>

          <div>
            <Label>등록일</Label>
            <DatePicker
              value={enrollDate}
              onChange={setEnrollDate}
              placeholder="등록일을 선택하세요"
            />
          </div>

          <div>
            <Label>해당 월</Label>
            <SelectField
              value={month}
              onChange={setMonth}
              options={monthOptions}
              placeholder="월을 선택하세요"
            />
          </div>
        </div>

        {loading && (
          <div className="py-8">
            <LoadingSpinner />
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        {result && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">원래 금액</div>
                <div className="text-lg font-semibold text-gray-900">
                  {result.originalAmount.toLocaleString()}원
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">일할 금액</div>
                <div className="text-lg font-semibold text-blue-600">
                  {result.proratedAmount.toLocaleString()}원
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">전체 수업일</div>
                <div className="text-lg font-semibold text-gray-900">
                  {result.totalClassDays}일
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">남은 수업일</div>
                <div className="text-lg font-semibold text-gray-900">
                  {result.remainingClassDays}일
                </div>
              </div>
            </div>
            <div className="pt-3 border-t border-blue-200">
              <div className="text-sm text-gray-600 mb-1">계산 상세</div>
              <div className="text-sm font-mono bg-white p-2 rounded border border-blue-100">
                {result.calculation}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
