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
import type { Level, Settings } from '@/types';

const levelSchema = z.object({
  name: z.string().min(1, '등급명을 입력해주세요.'),
  order: z.number().min(1, '순서는 1 이상이어야 합니다.'),
});

type LevelFormData = z.infer<typeof levelSchema>;

interface LevelManagerProps {
  levels: Level[] | undefined;
  settings: Settings | null;
  onUpdate: () => void;
}

export function LevelManager({ levels = [], settings, onUpdate }: LevelManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Level | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LevelFormData>({
    resolver: zodResolver(levelSchema),
  });

  const handleOpenDialog = (item: Level | null = null) => {
    setEditingItem(item);
    if (item) {
      reset({
        name: item.name,
        order: item.order,
      });
    } else {
      reset({
        name: '',
        order: levels.length + 1,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingItem(null);
    reset();
  };

  const onSubmit = async (data: LevelFormData) => {
    if (!settings) return;

    setLoading(true);

    try {
      const updatedLevels = editingItem
        ? levels.map((l) =>
            l.id === editingItem.id ? { ...l, name: data.name, order: data.order } : l
          )
        : [...levels, { id: generateId(), name: data.name, order: data.order }];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          levels: updatedLevels,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '저장에 실패했습니다.');
      }

      toast.success(editingItem ? '등급이 수정되었습니다.' : '등급이 추가되었습니다.');
      handleCloseDialog();
      onUpdate();
    } catch (error) {
      console.error('Level save error:', error);
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
      const updatedLevels = levels.filter((l) => l.id !== deletingId);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          levels: updatedLevels,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '삭제에 실패했습니다.');
      }

      toast.success('등급이 삭제되었습니다.');
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      onUpdate();
    } catch (error) {
      console.error('Level delete error:', error);
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const sortedLevels = [...levels].sort((a, b) => a.order - b.order);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>등급 관리</CardTitle>
          <Button onClick={() => handleOpenDialog()}>추가</Button>
        </CardHeader>
        <CardContent>
          <MasterDataList
            items={sortedLevels}
            onEdit={(item) => handleOpenDialog(item as Level)}
            onDelete={handleDeleteClick}
            showOrder
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '등급 수정' : '등급 추가'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="등급명"
              error={errors.name?.message}
              required
              htmlFor="name"
            >
              <Input
                id="name"
                {...register('name')}
                placeholder="초급, 중급, 고급 등"
              />
            </FormField>

            <FormField
              label="순서"
              error={errors.order?.message}
              required
              htmlFor="order"
            >
              <Input
                id="order"
                type="number"
                {...register('order', { valueAsNumber: true })}
                placeholder="1"
                min={1}
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
        title="등급 삭제"
        description="정말로 이 등급을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
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
