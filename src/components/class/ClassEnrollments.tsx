'use client';

import { useState } from 'react';
import { Plus, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/common/StatusBadge';
import EnrollmentForm from '@/components/enrollment/EnrollmentForm';
import DropConfirmDialog from '@/components/enrollment/DropConfirmDialog';
import { toast } from 'sonner';

interface Enrollment {
  id: string;
  studentId: string;
  student: { id: string; name: string };
  status: string;
  enrollmentDate: string;
}

interface ClassEnrollmentsProps {
  classId: string;
  enrollments: Enrollment[];
  onRefresh: () => void;
}

export default function ClassEnrollments({
  classId,
  enrollments,
  onRefresh,
}: ClassEnrollmentsProps) {
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);

  const handleDrop = async (enrollmentId: string, refundAmount: number) => {
    try {
      const response = await fetch(`/api/enrollments/${enrollmentId}/drop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refundAmount }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '수강 취소에 실패했습니다.');
      }

      toast.success('수강이 취소되었습니다.');
      setSelectedEnrollment(null);
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>수강생 목록</CardTitle>
          <Button onClick={() => setShowEnrollForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            수강 등록
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {enrollments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            등록된 수강생이 없습니다.
          </p>
        ) : (
          <div className="space-y-2">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment.id}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{enrollment.student.name}</p>
                    <p className="text-sm text-muted-foreground">
                      등록일: {enrollment.enrollmentDate}
                    </p>
                  </div>
                  <StatusBadge status={enrollment.status} />
                </div>
                {enrollment.status === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedEnrollment(enrollment)}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    수강 취소
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {showEnrollForm && (
        <EnrollmentForm
          classId={classId}
          onClose={() => setShowEnrollForm(false)}
          onSuccess={() => {
            setShowEnrollForm(false);
            onRefresh();
          }}
        />
      )}

      {selectedEnrollment && (
        <DropConfirmDialog
          enrollment={selectedEnrollment}
          onConfirm={(refundAmount) => handleDrop(selectedEnrollment.id, refundAmount)}
          onCancel={() => setSelectedEnrollment(null)}
        />
      )}
    </Card>
  );
}
