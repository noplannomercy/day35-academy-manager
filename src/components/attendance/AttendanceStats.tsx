"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

interface AttendanceStatsData {
  totalClasses: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendanceRate: number;
}

interface AttendanceStatsProps {
  classId: string;
}

export function AttendanceStats({ classId }: AttendanceStatsProps) {
  const [stats, setStats] = useState<AttendanceStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!classId) {
      setStats(null);
      setIsLoading(false);
      return;
    }

    loadStats();
  }, [classId]);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/attendance/stats?classId=${classId}`);

      if (!response.ok) {
        throw new Error("출석 통계를 불러오는데 실패했습니다");
      }

      const result = await response.json();
      setStats(result.data);
    } catch (err) {
      console.error("Failed to load attendance stats:", err);
      setError(err instanceof Error ? err.message : "데이터를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadStats} />;
  }

  if (!stats) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">출석 통계</h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-500">전체 수업</p>
          <p className="text-2xl font-bold">{stats.totalClasses}회</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">출석</p>
          <p className="text-2xl font-bold text-green-600">{stats.presentCount}회</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">결석</p>
          <p className="text-2xl font-bold text-red-600">{stats.absentCount}회</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">지각</p>
          <p className="text-2xl font-bold text-orange-600">{stats.lateCount}회</p>
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-500">출석률</p>
          <p className="text-2xl font-bold text-blue-600">{stats.attendanceRate.toFixed(1)}%</p>
        </div>
      </div>
    </Card>
  );
}
