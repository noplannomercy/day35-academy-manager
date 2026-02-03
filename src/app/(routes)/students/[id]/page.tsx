'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import StudentDetail from '@/components/student/StudentDetail';
import type { Student } from '@/types';

export default function StudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/students/${studentId}`);

      if (!response.ok) {
        throw new Error('수강생 정보를 불러오는데 실패했습니다.');
      }

      const data = await response.json();
      setStudent(data.data.student);
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

  if (error || !student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error || '수강생을 찾을 수 없습니다.'} onRetry={fetchStudent} />
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
          <h1 className="text-3xl font-bold">{student.name}</h1>
        </div>
        <Button onClick={() => router.push(`/students/${studentId}/edit`)}>
          <Pencil className="mr-2 h-4 w-4" />
          수정
        </Button>
      </div>

      <StudentDetail student={student} />
    </div>
  );
}
