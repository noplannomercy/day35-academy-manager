'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import StudentForm from '@/components/student/StudentForm';
import { toast } from 'sonner';
import type { Student } from '@/types';

export default function EditStudentPage() {
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

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '수정에 실패했습니다.');
      }

      toast.success('수강생 정보가 수정되었습니다.');
      router.push('/students');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '수정 중 오류가 발생했습니다.');
      throw err;
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
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">수강생 수정</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>수강생 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <StudentForm
            initialData={student}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
          />
        </CardContent>
      </Card>
    </div>
  );
}
