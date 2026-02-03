'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, ErrorMessage } from '@/components/common';
import InstructorList from '@/components/instructor/InstructorList';
import type { Instructor } from '@/types';

interface InstructorWithStats {
  instructor: Instructor;
  classCount: number;
  studentCount: number;
}

interface InstructorsResponse {
  data: InstructorWithStats[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function InstructorsPage() {
  const router = useRouter();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInstructors();
  }, [currentPage]);

  const fetchInstructors = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/instructors?page=${currentPage}&limit=10`);

      if (!response.ok) {
        throw new Error('강사 목록을 불러오는데 실패했습니다.');
      }

      const data: InstructorsResponse = await response.json();
      setInstructors(data.data.map(item => item.instructor));
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/instructors/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '삭제에 실패했습니다.');
      }

      await fetchInstructors();
    } catch (err) {
      alert(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorMessage message={error} onRetry={fetchInstructors} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">강사 관리</h1>
        <Button onClick={() => router.push('/instructors/new')}>
          <Plus className="mr-2 h-4 w-4" />
          강사 등록
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>강사 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <InstructorList
            instructors={instructors}
            onEdit={(id) => router.push(`/instructors/${id}/edit`)}
            onDelete={handleDelete}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
