'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ScheduleEditor from './ScheduleEditor';
import type { Class, Subject, Instructor, Room } from '@/types';

const classSchema = z.object({
  name: z.string().min(1, '반 이름을 입력하세요'),
  subjectId: z.string().min(1, '과목을 선택하세요'),
  instructorId: z.string().min(1, '강사를 선택하세요'),
  roomId: z.string().optional(),
  maxStudents: z.number().min(1, '정원은 1명 이상이어야 합니다'),
  monthlyFee: z.number().min(0, '수강료는 0원 이상이어야 합니다'),
  status: z.enum(['active', 'closed']),
  schedule: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    startTime: z.string(),
    endTime: z.string(),
  })).min(1, '최소 1개의 수업 일정을 추가하세요'),
});

type ClassFormData = z.infer<typeof classSchema>;

interface ClassFormProps {
  initialData?: Class;
  onSubmit: (data: ClassFormData) => Promise<void>;
  onCancel: () => void;
}

export default function ClassForm({ initialData, onSubmit, onCancel }: ClassFormProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      name: '',
      subjectId: '',
      instructorId: '',
      roomId: '',
      maxStudents: 10,
      monthlyFee: 0,
      status: 'active',
      schedule: [],
    },
  });

  const schedule = watch('schedule');
  const subjectId = watch('subjectId');
  const instructorId = watch('instructorId');
  const roomId = watch('roomId');

  // Debug: Log form values
  useEffect(() => {
    console.log('📝 Form values:', {
      subjectId,
      instructorId,
      roomId,
    });
  }, [subjectId, instructorId, roomId]);

  useEffect(() => {
    fetchMasterData();
  }, []);

  useEffect(() => {
    if (isReady && initialData) {
      console.log('🔄 Resetting form with data:', {
        subjectId: initialData.subjectId,
        instructorId: initialData.instructorId,
        roomId: initialData.roomId,
        subjects: subjects.length,
        instructors: instructors.length,
        rooms: rooms.length,
      });

      // Reset form with initial data after master data is loaded
      reset({
        name: initialData.name,
        subjectId: initialData.subjectId,
        instructorId: initialData.instructorId,
        roomId: initialData.roomId || '',
        maxStudents: initialData.maxStudents,
        monthlyFee: initialData.monthlyFee,
        status: initialData.status,
        schedule: initialData.schedule,
      });

      console.log('✅ Form reset complete');
    }
  }, [isReady, initialData, reset]);

  const fetchMasterData = async () => {
    try {
      const [subjectsRes, instructorsRes, roomsRes] = await Promise.all([
        fetch('/api/settings').then(res => res.json()),
        fetch('/api/instructors?page=1&limit=100').then(res => res.json()),
        fetch('/api/settings').then(res => res.json()),
      ]);

      setSubjects(subjectsRes.data.subjects || []);
      setInstructors(instructorsRes.data.map((item: any) => item.instructor).filter((i: Instructor) => i.status === 'active'));
      setRooms(roomsRes.data.rooms || []);
      setIsReady(true);
    } catch (error) {
      console.error('Failed to fetch master data:', error);
      setIsReady(true); // Set ready even on error to allow form interaction
    }
  };

  const onSubmitForm = async (data: ClassFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">양식 준비 중...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">반 이름 *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="예: 초등 4학년 수학 A반"
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">상태</Label>
          <Select
            value={watch('status') || 'active'}
            onValueChange={(value) => setValue('status', value as 'active' | 'closed')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">진행중</SelectItem>
              <SelectItem value="closed">종료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subjectId">과목 *</Label>
          <Select
            value={watch('subjectId') || undefined}
            onValueChange={(value) => setValue('subjectId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="과목 선택" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subjectId && (
            <p className="text-sm text-red-600">{errors.subjectId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="instructorId">강사 *</Label>
          <Select
            value={watch('instructorId') || undefined}
            onValueChange={(value) => setValue('instructorId', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="강사 선택" />
            </SelectTrigger>
            <SelectContent>
              {instructors.map((instructor) => (
                <SelectItem key={instructor.id} value={instructor.id}>
                  {instructor.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.instructorId && (
            <p className="text-sm text-red-600">{errors.instructorId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="roomId">강의실</Label>
          <Select
            value={watch('roomId') || undefined}
            onValueChange={(value) => setValue('roomId', value || '')}
          >
            <SelectTrigger>
              <SelectValue placeholder="강의실 선택 (선택사항)" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((room) => (
                <SelectItem key={room.id} value={room.id}>
                  {room.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxStudents">정원 *</Label>
          <Input
            id="maxStudents"
            type="number"
            {...register('maxStudents', { valueAsNumber: true })}
            min="1"
          />
          {errors.maxStudents && (
            <p className="text-sm text-red-600">{errors.maxStudents.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="monthlyFee">월 수강료 (원) *</Label>
          <Input
            id="monthlyFee"
            type="number"
            {...register('monthlyFee', { valueAsNumber: true })}
            min="0"
          />
          {errors.monthlyFee && (
            <p className="text-sm text-red-600">{errors.monthlyFee.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>수업 일정 *</Label>
        <ScheduleEditor
          schedule={schedule || []}
          onChange={(newSchedule) => setValue('schedule', newSchedule)}
        />
        {errors.schedule && (
          <p className="text-sm text-red-600">{errors.schedule.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '저장 중...' : initialData ? '수정' : '등록'}
        </Button>
      </div>
    </form>
  );
}
