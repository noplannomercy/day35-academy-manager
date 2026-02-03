'use client';

import { Eye, Pencil, Trash2, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, EmptyState, Pagination } from '@/components/common';
import type { Student } from '@/types';

interface StudentListProps {
  students: Student[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function StudentList({
  students,
  onView,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: StudentListProps) {
  if (students.length === 0) {
    return <EmptyState title="등록된 수강생이 없습니다" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
            onClick={() => onView(student.id)}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{student.name}</h3>
                <StatusBadge status={student.status} />
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {student.phone}
                </div>
                <div>등록일: {student.enrollDate}</div>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <Button variant="outline" size="sm" onClick={() => onView(student.id)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(student.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => onDelete(student.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
