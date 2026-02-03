'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ClassForm from '@/components/class/ClassForm';
import { toast } from 'sonner';

export default function NewClassPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '등록에 실패했습니다.');
      }

      toast.success('반이 등록되었습니다.');
      router.push('/classes');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
      throw err;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">반 등록</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>반 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <ClassForm onSubmit={handleSubmit} onCancel={() => router.back()} />
        </CardContent>
      </Card>
    </div>
  );
}
