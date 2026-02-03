"use client";

import { DatePicker } from "@/components/common/DatePicker";
import { Label } from "@/components/ui/label";

interface DateSelectorProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  label?: string;
  disabled?: boolean;
}

export function DateSelector({
  value,
  onChange,
  label = "날짜 선택",
  disabled = false
}: DateSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <DatePicker
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="날짜를 선택하세요"
      />
    </div>
  );
}
