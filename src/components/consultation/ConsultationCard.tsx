'use client';

import { useState } from 'react';
import { Consultation } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Trash2, ChevronDown, ChevronUp, Phone, User, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

interface ConsultationCardProps {
  consultation: Consultation;
  onRefresh: () => void;
}

export default function ConsultationCard({ consultation, onRefresh }: ConsultationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/consultations/${consultation.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '상담 기록 삭제 실패');
      }

      toast.success('상담 기록이 삭제되었습니다');
      onRefresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : '상담 기록 삭제 실패';
      toast.error(message);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const getTypeIcon = (type: Consultation['type']) => {
    switch (type) {
      case 'phone':
        return <Phone className="h-3 w-3" />;
      case 'visit':
        return <User className="h-3 w-3" />;
      case 'online':
        return <Globe className="h-3 w-3" />;
    }
  };

  const getTypeLabel = (type: Consultation['type']) => {
    switch (type) {
      case 'phone':
        return '전화';
      case 'visit':
        return '방문';
      case 'online':
        return '온라인';
    }
  };

  const getTypeBadgeVariant = (type: Consultation['type']) => {
    switch (type) {
      case 'phone':
        return 'default';
      case 'visit':
        return 'secondary';
      case 'online':
        return 'outline';
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={getTypeBadgeVariant(consultation.type)}>
                  <span className="mr-1">{getTypeIcon(consultation.type)}</span>
                  {getTypeLabel(consultation.type)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(consultation.date), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* 상담 내용 (축약 또는 전체) */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">상담 내용</p>
              <p className={`text-sm whitespace-pre-wrap ${!isExpanded && 'line-clamp-2'}`}>
                {consultation.content}
              </p>
            </div>

            {/* 다음 액션 (있는 경우) */}
            {consultation.nextAction && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">다음 액션</p>
                <p className="text-sm whitespace-pre-wrap">{consultation.nextAction}</p>
                {consultation.nextActionDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    예정일: {format(new Date(consultation.nextActionDate), 'yyyy년 M월 d일 (eee)', { locale: ko })}
                  </p>
                )}
              </div>
            )}

            {/* 등록 시간 */}
            <div className="text-xs text-muted-foreground pt-2 border-t">
              등록: {format(new Date(consultation.createdAt), 'yyyy-MM-dd HH:mm')}
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상담 기록 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 상담 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
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
