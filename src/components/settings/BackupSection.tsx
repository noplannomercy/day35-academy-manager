'use client';

import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export function BackupSection() {
  const [loading, setLoading] = useState(false);
  const [restoreConfirmOpen, setRestoreConfirmOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBackup = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/backup', {
        method: 'GET',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '백업 생성에 실패했습니다.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${format(new Date(), 'yyyyMMdd-HHmmss')}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('백업이 다운로드되었습니다.');
    } catch (error) {
      console.error('Backup error:', error);
      toast.error(
        error instanceof Error ? error.message : '백업에 실패했습니다.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json') {
        toast.error('JSON 파일만 업로드 가능합니다.');
        return;
      }
      setSelectedFile(file);
      setRestoreConfirmOpen(true);
    }
  };

  const handleRestoreConfirm = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setRestoreConfirmOpen(false);

    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(backupData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '복원에 실패했습니다.');
      }

      toast.success('데이터가 성공적으로 복원되었습니다.', {
        description: `학생 ${result.stats.students}명, 강사 ${result.stats.instructors}명, 수업 ${result.stats.classes}개`,
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setSelectedFile(null);

      // Reload the page to reflect restored data
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Restore error:', error);
      toast.error(
        error instanceof Error ? error.message : '복원에 실패했습니다.'
      );
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreCancel = () => {
    setRestoreConfirmOpen(false);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>백업 다운로드</CardTitle>
            <CardDescription>
              현재 데이터베이스의 전체 내용을 JSON 파일로 다운로드합니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBackup} disabled={loading} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              {loading ? '다운로드 중...' : '백업 다운로드'}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              파일명: backup-YYYYMMDD-HHmmss.json
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>복원</CardTitle>
            <CardDescription>
              백업 파일을 업로드하여 데이터를 복원합니다. 기존 데이터는 모두
              덮어씌워집니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
              id="backup-file-input"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              파일 선택
            </Button>
            <p className="text-sm text-destructive mt-4 font-medium">
              주의: 복원 시 현재 데이터가 모두 삭제됩니다.
            </p>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={restoreConfirmOpen}
        title="데이터 복원"
        description={`정말로 "${selectedFile?.name}" 파일로 데이터를 복원하시겠습니까? 현재 데이터는 모두 삭제되며, 이 작업은 되돌릴 수 없습니다.`}
        onConfirm={handleRestoreConfirm}
        onCancel={handleRestoreCancel}
        confirmText="복원"
        cancelText="취소"
        variant="destructive"
      />
    </>
  );
}
