'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportDialog } from './ExportDialog';

interface ExportButtonProps {
  type: 'students' | 'payments' | 'attendance';
  params?: Record<string, any>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  label?: string;
}

export function ExportButton({ type, params = {}, variant = 'outline', label }: ExportButtonProps) {
  const [open, setOpen] = useState(false);

  const defaultLabels = {
    students: '수강생 내보내기',
    payments: '수납 내보내기',
    attendance: '출석 내보내기',
  };

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Download className="w-4 h-4 mr-2" />
        {label || defaultLabels[type]}
      </Button>

      <ExportDialog type={type} params={params} open={open} onOpenChange={setOpen} />
    </>
  );
}
