'use client';

import { useState } from 'react';
import { Waitlist } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import EnrollDialog from './EnrollDialog';
import { toast } from 'sonner';

interface WaitlistTableProps {
  waitlists: Waitlist[];
  students: Array<{ id: string; name: string }>;
  onRefresh: () => void;
}

export default function WaitlistTable({ waitlists, students, onRefresh }: WaitlistTableProps) {
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [enrollWaitlist, setEnrollWaitlist] = useState<Waitlist | null>(null);

  const handleCancel = async () => {
    if (!cancelId) return;

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/waitlist/${cancelId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '대기 취소 실패');
      }

      toast.success('대기가 취소되었습니다');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : '대기 취소 실패';
      toast.error(message);
    } finally {
      setIsCancelling(false);
      setCancelId(null);
    }
  };

  const getStatusLabel = (status: Waitlist['status']) => {
    switch (status) {
      case 'waiting':
        return '대기중';
      case 'enrolled':
        return '수강전환';
      case 'cancelled':
        return '취소됨';
    }
  };

  const getStatusBadgeVariant = (status: Waitlist['status']) => {
    switch (status) {
      case 'waiting':
        return 'default';
      case 'enrolled':
        return 'secondary';
      case 'cancelled':
        return 'outline';
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    return student?.name || '알 수 없음';
  };

  // 우선순위순 정렬 (낮은 번호가 우선)
  const sortedWaitlists = [...waitlists].sort((a, b) => a.priority - b.priority);

  return (
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">우선순위</th>
                <th className="px-4 py-3 text-left text-sm font-medium">학생명</th>
                <th className="px-4 py-3 text-left text-sm font-medium">신청일</th>
                <th className="px-4 py-3 text-left text-sm font-medium">상태</th>
                <th className="px-4 py-3 text-right text-sm font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {sortedWaitlists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    대기자가 없습니다
                  </td>
                </tr>
              ) : (
                sortedWaitlists.map((waitlist) => (
                  <tr key={waitlist.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm font-semibold">{waitlist.priority}</td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {getStudentName(waitlist.studentId)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(waitlist.registeredAt), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getStatusBadgeVariant(waitlist.status)}>
                        {getStatusLabel(waitlist.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {waitlist.status === 'waiting' && (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEnrollWaitlist(waitlist)}
                          >
                            <UserPlus className="mr-1 h-4 w-4" />
                            수강 전환
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCancelId(waitlist.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cancel Dialog */}
      <AlertDialog open={!!cancelId} onOpenChange={() => setCancelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>대기 취소</AlertDialogTitle>
            <AlertDialogDescription>
              이 대기자를 취소하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} disabled={isCancelling}>
              {isCancelling ? '취소 중...' : '확인'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Enroll Dialog */}
      {enrollWaitlist && (
        <EnrollDialog
          open={!!enrollWaitlist}
          onOpenChange={() => setEnrollWaitlist(null)}
          waitlist={enrollWaitlist}
          studentName={getStudentName(enrollWaitlist.studentId)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
