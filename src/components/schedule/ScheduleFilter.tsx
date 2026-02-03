'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Instructor, Room, Settings } from '@/types';

interface ScheduleFilterProps {
  instructorId?: string;
  roomId?: string;
  onInstructorChange: (id?: string) => void;
  onRoomChange: (id?: string) => void;
}

export function ScheduleFilter({
  instructorId,
  roomId,
  onInstructorChange,
  onRoomChange,
}: ScheduleFilterProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [instructorsRes, settingsRes] = await Promise.all([
          fetch('/api/instructors'),
          fetch('/api/settings'),
        ]);

        if (instructorsRes.ok) {
          const instructorsData = await instructorsRes.json();
          setInstructors(instructorsData.data.filter((i: Instructor) => i.status === 'active'));
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          setRooms(settingsData.data.rooms || []);
        }
      } catch (error) {
        console.error('Failed to fetch filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="instructor-filter">강사</Label>
        <Select
          value={instructorId || 'all'}
          onValueChange={(value) => onInstructorChange(value === 'all' ? undefined : value)}
        >
          <SelectTrigger id="instructor-filter">
            <SelectValue placeholder="전체 강사" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 강사</SelectItem>
            {instructors.map((instructor) => (
              <SelectItem key={instructor.id} value={instructor.id}>
                {instructor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label htmlFor="room-filter">강의실</Label>
        <Select value={roomId || 'all'} onValueChange={(value) => onRoomChange(value === 'all' ? undefined : value)}>
          <SelectTrigger id="room-filter">
            <SelectValue placeholder="전체 강의실" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 강의실</SelectItem>
            {rooms.map((room) => (
              <SelectItem key={room.id} value={room.id}>
                {room.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
