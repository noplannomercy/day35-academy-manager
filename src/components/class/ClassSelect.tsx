'use client';

import { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Class } from '@/types';

interface ClassSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  filter?: 'all' | 'active';
}

export default function ClassSelect({
  value,
  onChange,
  placeholder = '반 선택',
  filter = 'active',
}: ClassSelectProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, [filter]);

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/classes?page=1&limit=100');

      if (!response.ok) {
        throw new Error('Failed to fetch classes');
      }

      const data = await response.json();
      const classList = data.data.map((item: any) => item.class);

      const filteredClasses = filter === 'active'
        ? classList.filter((c: Class) => c.status === 'active')
        : classList;

      setClasses(filteredClasses);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="로딩 중..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {classes.map((classItem) => (
          <SelectItem key={classItem.id} value={classItem.id}>
            {classItem.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
