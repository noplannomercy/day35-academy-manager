'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, EmptyState } from '@/components/common';

interface Consultation {
  id: string;
  date: string;
  type: string;
  content: string;
}

interface StudentConsultationsProps {
  studentId: string;
}

export default function StudentConsultations({ studentId }: StudentConsultationsProps) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchConsultations();
  }, [studentId]);

  const fetchConsultations = async () => {
    try {
      const response = await fetch(`/api/consultations?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setConsultations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch consultations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (consultations.length === 0) {
    return <EmptyState title="상담 내역이 없습니다" />;
  }

  const typeLabels: Record<string, string> = {
    phone: '전화',
    visit: '방문',
    online: '온라인',
  };

  return (
    <div className="space-y-4">
      {consultations.map((consultation) => (
        <Card key={consultation.id}>
          <CardContent className="pt-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">
                  {typeLabels[consultation.type] || consultation.type}
                </span>
                <span className="text-sm text-gray-600">{consultation.date}</span>
              </div>
              <p className="text-gray-700">{consultation.content}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
