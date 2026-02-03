'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string; // HH:mm format
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  placeholder = 'HH:mm',
  disabled = false,
  className,
}: TimePickerProps) {
  const [inputValue, setInputValue] = useState(value);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateTime = (timeString: string): boolean => {
    // Check format HH:mm
    const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
    return timeRegex.test(timeString);
  };

  const handleBlur = () => {
    if (!inputValue) {
      setError(null);
      onChange('');
      return;
    }

    if (validateTime(inputValue)) {
      setError(null);
      onChange(inputValue);
    } else {
      setError('올바른 시간 형식이 아닙니다 (HH:mm)');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setError(null);
  };

  return (
    <div className="space-y-1">
      <Input
        type="text"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error && 'border-destructive', className)}
      />
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  );
}
