'use client';

import { useRouter } from 'next/navigation';
import type { Class, Instructor, Room } from '@/types';
import { cn } from '@/lib/utils';

interface ScheduleCellProps {
  class: Class;
  instructor: Instructor;
  subject: { id: string; name: string };
  room?: Room;
  startTime: string;
  endTime?: string;
  compact?: boolean;
}

const SUBJECT_COLORS: Record<string, string> = {
  default: 'bg-blue-100 border-blue-300 text-blue-900',
};

export function ScheduleCell({
  class: classData,
  instructor,
  subject,
  room,
  startTime,
  endTime,
  compact = false,
}: ScheduleCellProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/classes/${classData.id}`);
  };

  // Use instructor color if available
  const bgColor = instructor.color
    ? `bg-${instructor.color}-100 border-${instructor.color}-300 text-${instructor.color}-900`
    : SUBJECT_COLORS[subject.id] || SUBJECT_COLORS.default;

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left p-2 rounded border-l-4 hover:shadow-md transition-shadow',
        bgColor,
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      <div className="font-semibold truncate">{classData.name}</div>
      <div className="text-xs opacity-80 truncate">{subject.name}</div>
      <div className="text-xs opacity-70 truncate">{instructor.name}</div>
      <div className="text-xs font-medium mt-1">
        {endTime ? `${startTime}-${endTime}` : startTime}
      </div>
      {room && !compact && <div className="text-xs opacity-60">{room.name}</div>}
    </button>
  );
}
