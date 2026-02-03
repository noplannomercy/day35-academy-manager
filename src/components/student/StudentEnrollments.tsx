'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner, EmptyState, StatusBadge } from '@/components/common';

interface Enrollment {
  id: string;
  className: string;
  enrollDate: string;
  status: string;
}

interface StudentEnrollmentsProps {
  studentId: string;
}

export default function StudentEnrollments({ studentId }: StudentEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEnrollments();
  }, [studentId]);

  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`/api/enrollments?studentId=${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (enrollments.length === 0) {
    return <EmptyState title="수강 내역이 없습니다" />;
  }

  return (
    <div className="space-y-4">
      {enrollments.map((enrollment) => (
        <Card key={enrollment.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{enrollment.className}</h3>
                  <StatusBadge status={enrollment.status} />
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  등록일: {enrollment.enrollDate}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
