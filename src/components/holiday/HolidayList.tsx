'use client';

import { useState } from 'react';
import { Holiday } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface HolidayListProps {
  holidays: Holiday[];
  onRefresh: () => void;
}

export default function HolidayList({ holidays, onRefresh }: HolidayListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/holidays/${deleteId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '휴일 삭제 실패');
      }

      toast.success('휴일이 삭제되었습니다');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : '휴일 삭제 실패';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const getTypeLabel = (type: Holiday['type']) => {
    return type === 'public' ? '공휴일' : '수동등록';
  };

  const getTypeBadgeVariant = (type: Holiday['type']) => {
    return type === 'public' ? 'default' : 'secondary';
  };

  // 날짜순 정렬 (최신순)
  const sortedHolidays = [...holidays].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">날짜</th>
                <th className="px-4 py-3 text-left text-sm font-medium">휴일명</th>
                <th className="px-4 py-3 text-left text-sm font-medium">구분</th>
                <th className="px-4 py-3 text-left text-sm font-medium">등록일</th>
                <th className="px-4 py-3 text-right text-sm font-medium">작업</th>
              </tr>
            </thead>
            <tbody>
              {sortedHolidays.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    등록된 휴일이 없습니다
                  </td>
                </tr>
              ) : (
                sortedHolidays.map((holiday) => (
                  <tr key={holiday.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      {format(new Date(holiday.date), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{holiday.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={getTypeBadgeVariant(holiday.type)}>
                        {getTypeLabel(holiday.type)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(holiday.createdAt), 'yyyy-MM-dd HH:mm')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {holiday.type === 'manual' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteId(holiday.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>휴일 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 휴일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? '삭제 중...' : '삭제'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
