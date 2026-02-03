'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import ClassDetail from '@/components/class/ClassDetail';
import type { Class } from '@/types';

export default function ClassDetailPage() {
  const router = useRouter();
  const params = useParams();
  const classId = params.id as string;

  const [classData, setClassData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchClass();
  }, [classId]);

  const fetchClass = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/classes/${classId}`);

      if (!response.ok) {
        throw new Error('반 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();

      // Transform enrollments from API format to component format
      const transformedData = {
        ...data.data,
        enrollments: (data.data.enrollments || []).map((item: any) => ({
          id: item.enrollment.id,
          studentId: item.enrollment.studentId,
          student: item.student,
          status: item.enrollment.status,
          enrollmentDate: item.enrollment.enrollDate,
        })),
        waitlist: (data.data.waitlist || []).map((item: any) => ({
          id: item.id,
          studentId: item.studentId,
          student: item.student || { id: item.studentId, name: '알 수 없음' },
          status: item.status,
          priority: item.priority,
          requestDate: item.requestDate,
        })),
      };

      setClassData(transformedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error || '반을 찾을 수 없습니다.'} onRetry={fetchClass} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{classData.class.name}</h1>
        </div>
        <Button onClick={() => router.push(`/classes/${classId}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Button>
      </div>

      <ClassDetail classData={classData} onRefresh={fetchClass} />
    </div>
  );
}
