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
import type { Room, Settings } from '@/types';

const roomSchema = z.object({
  name: z.string().min(1, '교실명을 입력해주세요.'),
});

type RoomFormData = z.infer<typeof roomSchema>;

interface RoomManagerProps {
  rooms: Room[] | undefined;
  settings: Settings | null;
  onUpdate: () => void;
}

export function RoomManager({ rooms = [], settings, onUpdate }: RoomManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Room | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(roomSchema),
  });

  const handleOpenDialog = (item: Room | null = null) => {
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

  const onSubmit = async (data: RoomFormData) => {
    if (!settings) return;

    setLoading(true);

    try {
      const updatedRooms = editingItem
        ? rooms.map((r) => (r.id === editingItem.id ? { ...r, name: data.name } : r))
        : [...rooms, { id: generateId(), name: data.name }];

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          rooms: updatedRooms,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '저장에 실패했습니다.');
      }

      toast.success(editingItem ? '교실이 수정되었습니다.' : '교실이 추가되었습니다.');
      handleCloseDialog();
      onUpdate();
    } catch (error) {
      console.error('Room save error:', error);
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
      const updatedRooms = rooms.filter((r) => r.id !== deletingId);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          rooms: updatedRooms,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '삭제에 실패했습니다.');
      }

      toast.success('교실이 삭제되었습니다.');
      setDeleteConfirmOpen(false);
      setDeletingId(null);
      onUpdate();
    } catch (error) {
      console.error('Room delete error:', error);
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>교실 관리</CardTitle>
          <Button onClick={() => handleOpenDialog()}>추가</Button>
        </CardHeader>
        <CardContent>
          <MasterDataList
            items={rooms}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? '교실 수정' : '교실 추가'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              label="교실명"
              error={errors.name?.message}
              required
              htmlFor="name"
            >
              <Input
                id="name"
                {...register('name')}
                placeholder="101호, 202호 등"
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
        title="교실 삭제"
        description="정말로 이 교실을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
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
