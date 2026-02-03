'use client';

import { Phone, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/common';
import type { Instructor } from '@/types';

interface InstructorCardProps {
  instructor: Instructor;
  onClick?: () => void;
}

export default function InstructorCard({ instructor, onClick }: InstructorCardProps) {
  return (
    <Card
      className={onClick ? 'cursor-pointer hover:bg-gray-50' : ''}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="font-semibold text-lg">{instructor.name}</h3>
              <StatusBadge status={instructor.status} />
            </div>
            <div className="space-y-2 text-sm text-gray-600">
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
                <div>월급여: {instructor.monthlySalary.toLocaleString()}원</div>
              )}
              {instructor.notes && (
                <div className="text-gray-500 text-xs mt-2">{instructor.notes}</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
