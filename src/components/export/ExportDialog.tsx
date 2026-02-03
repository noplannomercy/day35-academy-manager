'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Download, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ExportDialogProps {
  type: 'students' | 'payments' | 'attendance';
  params?: Record<string, any>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EXPORT_DESCRIPTIONS = {
  students: '현재 필터 조건에 맞는 수강생 목록을 Excel 파일로 다운로드합니다.',
  payments: '현재 필터 조건에 맞는 수납 내역을 Excel 파일로 다운로드합니다.',
  attendance: '현재 필터 조건에 맞는 출석 기록을 Excel 파일로 다운로드합니다.',
};

const EXPORT_TITLES = {
  students: '수강생 목록 내보내기',
  payments: '수납 내역 내보내기',
  attendance: '출석 기록 내보내기',
};

export function ExportDialog({ type, params = {}, open, onOpenChange }: ExportDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      // Build query string from params
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => [key, String(value)])
      ).toString();

      const url = `/api/export/${type}${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to export');
      }

      // Get blob from response
      const blob = await response.blob();

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `${type}_${format(new Date(), 'yyyyMMdd')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success('Excel 파일이 다운로드되었습니다.');

      onOpenChange(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error(error instanceof Error ? error.message : '파일 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const renderParams = () => {
    if (!params || Object.keys(params).length === 0) {
      return <p className="text-sm text-muted-foreground">필터 조건: 전체</p>;
    }

    return (
      <div className="space-y-1">
        <p className="text-sm font-medium">필터 조건:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          {Object.entries(params).map(([key, value]) => {
            if (value === undefined || value === null || value === '') return null;
            return (
              <li key={key}>
                • {formatParamLabel(key)}: {formatParamValue(key, value)}
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            {EXPORT_TITLES[type]}
          </DialogTitle>
          <DialogDescription>{EXPORT_DESCRIPTIONS[type]}</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          {renderParams()}

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm">
              <strong>파일 형식:</strong> Excel (.xlsx)
            </p>
            <p className="text-sm mt-1">
              <strong>파일명:</strong> {type}_{format(new Date(), 'yyyyMMdd')}.xlsx
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={loading}>
            <Download className="w-4 h-4 mr-2" />
            {loading ? '다운로드 중...' : 'Excel 다운로드'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function formatParamLabel(key: string): string {
  const labels: Record<string, string> = {
    status: '상태',
    month: '월',
    classId: '반',
    studentId: '수강생',
    startDate: '시작일',
    endDate: '종료일',
    levelId: '등급',
  };
  return labels[key] || key;
}

function formatParamValue(key: string, value: any): string {
  // Format specific values
  if (key === 'status') {
    const statusLabels: Record<string, string> = {
      active: '수강중',
      inactive: '일시중단',
      withdrawn: '퇴원',
      paid: '납부완료',
      partial: '부분납부',
      unpaid: '미납',
      overdue: '연체',
    };
    return statusLabels[value] || value;
  }

  return String(value);
}
