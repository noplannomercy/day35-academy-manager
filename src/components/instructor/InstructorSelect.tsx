'use client';

import { useState, useEffect } from 'react';
import { SelectField, LoadingSpinner } from '@/components/common';
import type { Instructor } from '@/types';

interface InstructorSelectProps {
  value: string;
  onChange: (value: string) => void;
  subjectId?: string;
  error?: string;
}

export default function InstructorSelect({
  value,
  onChange,
  subjectId,
  error,
}: InstructorSelectProps) {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await fetch('/api/instructors');
      if (response.ok) {
        const data = await response.json();
        const instructorList = data.data.map((item: any) => item.instructor);
        setInstructors(instructorList.filter((i: Instructor) => i.status === 'active'));
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="sm" />;
  }

  const filteredInstructors = subjectId
    ? instructors.filter((i) => i.subjectIds.includes(subjectId))
    : instructors;

  return (
    <SelectField
      value={value}
      onChange={onChange}
      options={filteredInstructors.map((instructor) => ({
        value: instructor.id,
        label: instructor.name,
      }))}
      placeholder="강사를 선택하세요"
    />
  );
}
