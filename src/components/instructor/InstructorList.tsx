'use client';

import { Pencil, Trash2, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge, EmptyState, Pagination } from '@/components/common';
import type { Instructor } from '@/types';

interface InstructorListProps {
  instructors: Instructor[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function InstructorList({
  instructors,
  onEdit,
  onDelete,
  currentPage,
  totalPages,
  onPageChange,
}: InstructorListProps) {
  if (instructors.length === 0) {
    return <EmptyState title="등록된 강사가 없습니다" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {instructors.map((instructor) => (
          <div
            key={instructor.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{instructor.name}</h3>
                <StatusBadge status={instructor.status} />
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {instructor.phone}
                </div>
                {instructor.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {instructor.email}
                  </div>
                )}
                {instructor.monthlySalary && (
                  <div>
                    월급여: {instructor.monthlySalary.toLocaleString()}원
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(instructor.id)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(instructor.id)}
              >
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
