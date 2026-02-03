'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const formSchema = z.object({
  studentId: z.string().min(1, '학생을 선택해주세요'),
});

type FormData = z.infer<typeof formSchema>;

interface WaitlistFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  onSuccess: () => void;
}

export default function WaitlistForm({ open, onOpenChange, classId, onSuccess }: WaitlistFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: '',
    },
  });

  useEffect(() => {
    if (open) {
      fetchStudents();
    }
  }, [open]);

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const response = await fetch('/api/students?status=active&limit=1000');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || '학생 목록 조회 실패');
      }

      setStudents(result.data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : '학생 목록 조회 실패';
      toast.error(message);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: data.studentId,
          classId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'DUPLICATE_WAITLIST') {
          throw new Error('이미 대기 등록된 학생입니다');
        }
        if (result.code === 'STUDENT_INACTIVE') {
          throw new Error('비활성 학생은 대기 등록할 수 없습니다');
        }
        if (result.code === 'ALREADY_ENROLLED') {
          throw new Error('이미 수강 중인 학생입니다');
        }
        throw new Error(result.error || '대기 등록 실패');
      }

      toast.success('대기자가 등록되었습니다');
      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : '대기 등록 실패';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>대기자 등록</DialogTitle>
          <DialogDescription>
            정원 초과 시 대기 목록에 등록합니다. 우선순위는 자동으로 부여됩니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>학생 선택 *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="학생 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {isLoadingStudents ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          로딩 중...
                        </div>
                      ) : students.length === 0 ? (
                        <div className="px-2 py-1 text-sm text-muted-foreground">
                          활성 학생이 없습니다
                        </div>
                      ) : (
                        students.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingStudents}>
                {isSubmitting ? '등록 중...' : '등록'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
