'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/common/DatePicker';
import ConflictWarning from './ConflictWarning';
import { toast } from 'sonner';
import type { Student } from '@/types';

const enrollmentSchema = z.object({
  studentId: z.string().min(1, '수강생을 선택하세요'),
  enrollmentDate: z.string().min(1, '등록일을 선택하세요'),
});

type EnrollmentFormData = z.infer<typeof enrollmentSchema>;

interface EnrollmentFormProps {
  classId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnrollmentForm({
  classId,
  onClose,
  onSuccess,
}: EnrollmentFormProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const {
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      studentId: '',
      enrollmentDate: new Date().toISOString().slice(0, 10),
    },
  });

  const studentId = watch('studentId');
  const enrollmentDate = watch('enrollmentDate');

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (studentId) {
      checkConflict();
    } else {
      setConflictWarning(null);
    }
  }, [studentId]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students?page=1&limit=100');
      if (!response.ok) throw new Error('Failed to fetch students');

      const data = await response.json();
      const studentList = data.data;
      setStudents(studentList.filter((s: Student) => s.status === 'active'));
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const checkConflict = async () => {
    try {
      const response = await fetch(
        `/api/enrollments/check-conflict?studentId=${studentId}&classId=${classId}`
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.code === 'SCHEDULE_CONFLICT') {
          setConflictWarning(error.error);
        } else {
          setConflictWarning(null);
        }
      } else {
        setConflictWarning(null);
      }
    } catch (error) {
      console.error('Failed to check conflict:', error);
    }
  };

  const onSubmit = async (data: EnrollmentFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          classId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        if (error.code === 'CLASS_FULL_WAITLISTED') {
          toast.info('정원이 초과되어 대기 명단에 등록되었습니다.');
          onSuccess();
          return;
        }
        throw new Error(error.error || '등록에 실패했습니다.');
      }

      toast.success('수강 등록이 완료되었습니다.');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>수강 등록</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="studentId">수강생 *</Label>
            <Select
              value={studentId}
              onValueChange={(value) => setValue('studentId', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="수강생 선택" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.studentId && (
              <p className="text-sm text-red-600">{errors.studentId.message}</p>
            )}
          </div>

          {conflictWarning && <ConflictWarning message={conflictWarning} />}

          <div className="space-y-2">
            <Label>등록일 *</Label>
            <DatePicker
              value={enrollmentDate ? new Date(enrollmentDate) : undefined}
              onChange={(date) =>
                setValue('enrollmentDate', date ? date.toISOString().slice(0, 10) : '')
              }
            />
            {errors.enrollmentDate && (
              <p className="text-sm text-red-600">{errors.enrollmentDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '등록 중...' : '등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
