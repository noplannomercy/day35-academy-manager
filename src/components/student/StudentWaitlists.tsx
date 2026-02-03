'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/common';

interface Waitlist {
  id: string;
  className: string;
  registeredAt: string;
  priority: number;
  status: string;
}

interface StudentWaitlistsProps {
  studentId: string;
}

export default function StudentWaitlists({ studentId }: StudentWaitlistsProps) {
  const [waitlists, setWaitlists] = useState<Waitlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWaitlists();
  }, [studentId]);

  const fetchWaitlists = async () => {
    try {
      const response = await fetch(`/api/waitlist?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setWaitlists(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch waitlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (waitlists.length === 0) {
    return <EmptyState title="대기 내역이 없습니다" />;
  }

  return (
    <div className="space-y-4">
      {waitlists.map((waitlist) => (
        <Card key={waitlist.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{waitlist.className}</h3>
                  <StatusBadge status={waitlist.status} />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  대기 순번: {waitlist.priority}번 | 등록일: {waitlist.registeredAt.slice(0, 10)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
