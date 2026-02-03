'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner, ErrorMessage, SearchInput } from '@/components/common';
import StudentList from '@/components/student/StudentList';
import { ExportButton } from '@/components/export/ExportButton';
import type { Student } from '@/types';

interface StudentsResponse {
  data: Student[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function StudentsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [currentPage, searchQuery]);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
      });
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/students?${params}`);

      if (!response.ok) {
        throw new Error('수강생 목록을 불러오는데 실패했습니다.');
      }

      const data: StudentsResponse = await response.json();
      setStudents(data.data);
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
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '삭제에 실패했습니다.');
      }

      await fetchStudents();
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
        <ErrorMessage message={error} onRetry={fetchStudents} />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">수강생 관리</h1>
        <div className="flex gap-2">
          <ExportButton type="students" params={{ search: searchQuery }} />
          <Button onClick={() => router.push('/students/new')}>
            <Plus className="mr-2 h-4 w-4" />
            수강생 등록
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>수강생 목록</CardTitle>
            <div className="w-64">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="이름, 전화번호로 검색"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StudentList
            students={students}
            onView={(id) => router.push(`/students/${id}`)}
            onEdit={(id) => router.push(`/students/${id}/edit`)}
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
