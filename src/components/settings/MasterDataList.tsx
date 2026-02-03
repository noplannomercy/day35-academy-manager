'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit, Trash2 } from 'lucide-react';

interface MasterDataItem {
  id: string;
  name: string;
  order?: number;
}

interface MasterDataListProps {
  items: MasterDataItem[];
  onEdit: (item: MasterDataItem) => void;
  onDelete: (id: string) => void;
  showOrder?: boolean;
}

export function MasterDataList({
  items,
  onEdit,
  onDelete,
  showOrder = false,
}: MasterDataListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        등록된 항목이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showOrder && (
                <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">
                  {item.order}
                </span>
              )}
              <span className="font-medium">{item.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
