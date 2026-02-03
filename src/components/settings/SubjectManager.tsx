'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField } from '@/components/common/FormField';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { MasterDataList } from './MasterDataList';
import { generateId } from '@/lib/utils';
import type { Subject, Settings } from '@/types';

const subjectSchema = z.object({
  name: z.string().min(1, '과목명을 입력해주세요.'),
});

type SubjectFormData = z.infer<typeof subjectSchema>;

interface SubjectManagerProps {
  subjects: Subject[] | undefined;
  settings: Settings | null;
  onUpdate: () => void;
}

export function SubjectManager({
  subjects = [],
  settings,
  onUpdate,
}: SubjectManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Subject | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
  });

  const handleOpenDialog = (item: Subject | null = null) => {
    setEditingItem(item);
    if (item) {
      reset({
        name: item.name,
      });
    } else {
      reset({
        name: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (data: SubjectFormData) => {
    if (!settings) return;

    setLoading(true);

    try {
      const updatedSubjects = editingItem
        ? subjects.map((s) => (s.id === editingItem.id ? { ...s, name: data.name } : s))
        : [...subjects, { id: generateId(), name: data.name }];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          subjects: updatedSubjects,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '저장에 실패했습니다.');
      }

      toast.success(editingItem ? '과목이 수정되었습니다.' : '과목이 추가되었습니다.');
      handleCloseDialog();
      onUpdate();
    } catch (error) {
      console.error('Subject save error:', error);
      toast.error(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!settings || !deletingId) return;

    setLoading(true);

    try {
      const updatedSubjects = subjects.filter((s) => s.id !== deletingId);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          subjects: updatedSubjects,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '삭제에 실패했습니다.');
      }

      toast.success('과목이 삭제되었습니다.');
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      onUpdate();
    } catch (error) {
      console.error('Subject delete error:', error);
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>과목 관리</CardTitle>
          <Button onClick={() => handleOpenDialog()}>추가</Button>
        </CardHeader>
        <CardContent>
          <MasterDataList
            items={subjects}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '과목 수정' : '과목 추가'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="과목명"
              error={errors.name?.message}
              required
              htmlFor="name"
            >
              <Input
                id="name"
                {...register('name')}
                placeholder="수학, 영어, 과학 등"
              />
            </FormField>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                disabled={loading}
              >
                취소
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? '저장 중...' : '저장'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="과목 삭제"
        description="정말로 이 과목을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmOpen(false);
          setDeletingId(null);
        }}
        confirmText="삭제"
        cancelText="취소"
      />
    </>
  );
}
