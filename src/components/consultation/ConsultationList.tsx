'use client';

import { useState, useEffect } from 'react';
import { Consultation } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ConsultationCard from './ConsultationCard';
import ConsultationForm from './ConsultationForm';
import { toast } from 'sonner';

interface ConsultationListProps {
  studentId: string;
}

export default function ConsultationList({ studentId }: ConsultationListProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchConsultations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/consultations?studentId=${studentId}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '상담 기록 조회 실패');
      }

      setConsultations(result.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : '상담 기록 조회 실패';
      toast.error(message);
      setConsultations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, [studentId]);

  // 날짜순 정렬 (최신순)
  const sortedConsultations = [...consultations].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          총 {consultations.length}개의 상담 기록
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          상담 기록 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">로딩 중...</div>
      ) : sortedConsultations.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          등록된 상담 기록이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {sortedConsultations.map((consultation) => (
            <ConsultationCard
              key={consultation.id}
              consultation={consultation}
              onRefresh={fetchConsultations}
            />
          ))}
        </div>
      )}

      <ConsultationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        studentId={studentId}
        onSuccess={fetchConsultations}
      />
    </div>
  );
}
