import { Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, DataTableColumn } from '@/components/common/DataTable';
import { Pagination } from '@/components/common/Pagination';
import { StatusBadge } from '@/components/common/StatusBadge';
import type { Class } from '@/types';

interface ClassWithDetails {
  class: Class;
  instructor: { id: string; name: string };
  subject: { id: string; name: string };
  room?: { id: string; name: string };
  currentStudents: number;
  waitlistCount: number;
}

interface ClassListProps {
  classes: ClassWithDetails[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function ClassList({
  classes,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: ClassListProps) {
  const data = classes.map((item) => ({
    ...item,
    id: item.class.id,
  }));

  const columns: DataTableColumn<typeof data[0]>[] = [
    {
      key: 'class.name',
      label: '반 이름',
      render: (item) => item.class.name,
    },
    {
      key: 'subject.name',
      label: '과목',
      render: (item) => item.subject.name,
    },
    {
      key: 'instructor.name',
      label: '강사',
      render: (item) => item.instructor.name,
    },
    {
      key: 'room',
      label: '강의실',
      render: (item) => item.room?.name || '-',
    },
    {
      key: 'students',
      label: '수강생',
      render: (item) => (
        <div className="text-sm">
          <div>{item.currentStudents}/{item.class.maxStudents}</div>
          {item.waitlistCount > 0 && (
            <div className="text-muted-foreground">대기: {item.waitlistCount}</div>
          )}
        </div>
      ),
    },
    {
      key: 'period',
      label: '등록일',
      render: (item) => (
        <div className="text-sm">
          <div>{item.class.createdAt}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: '상태',
      render: (item) => <StatusBadge status={item.class.status} />,
    },
    {
      key: 'actions',
      label: '작업',
      render: (item) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView(item.class.id); }}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit(item.class.id); }}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onDelete(item.class.id); }}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable data={data} columns={columns} />
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
