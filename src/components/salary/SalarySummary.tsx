'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface MonthlyData {
  month: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  instructorCount: number;
}

interface SalaryStatsResponse {
  data: MonthlyData[];
  yearTotal: {
    totalAmount: number;
    paidAmount: number;
  };
}

interface SalaryStats {
  totalPaid: number;
  totalUnpaid: number;
  monthlyAverage: number;
}

export default function SalarySummary() {
  const [stats, setStats] = useState<SalaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/instructor-salaries/stats');
      if (response.ok) {
        const apiData: SalaryStatsResponse = await response.json();

        // Calculate stats from API response
        const totalPaid = apiData.yearTotal.paidAmount;
        const totalUnpaid = apiData.yearTotal.totalAmount - apiData.yearTotal.paidAmount;
        const monthlyAverage = apiData.data.length > 0
          ? apiData.yearTotal.totalAmount / 12
          : 0;

        setStats({
          totalPaid,
          totalUnpaid,
          monthlyAverage,
        });
      }
    } catch (error) {
      console.error('Failed to fetch salary stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">지급 완료</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.totalPaid || 0).toLocaleString()}원
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">미지급</CardTitle>
          <AlertCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.totalUnpaid || 0).toLocaleString()}원
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">월 평균</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(stats.monthlyAverage || 0).toLocaleString()}원
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
