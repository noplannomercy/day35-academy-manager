'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';

interface ScheduleItem {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface ScheduleEditorProps {
  schedule: ScheduleItem[];
  onChange: (schedule: ScheduleItem[]) => void;
}

const DAYS_OF_WEEK = [
  { value: 0, label: '일요일' },
  { value: 1, label: '월요일' },
  { value: 2, label: '화요일' },
  { value: 3, label: '수요일' },
  { value: 4, label: '목요일' },
  { value: 5, label: '금요일' },
  { value: 6, label: '토요일' },
];

export default function ScheduleEditor({ schedule, onChange }: ScheduleEditorProps) {
  const [newItem, setNewItem] = useState<ScheduleItem>({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '10:00',
  });

  const addScheduleItem = () => {
    if (newItem.startTime && newItem.endTime) {
      onChange([...schedule, { ...newItem }]);
      setNewItem({
        dayOfWeek: 1,
        startTime: '09:00',
        endTime: '10:00',
      });
    }
  };

  const removeScheduleItem = (index: number) => {
    onChange(schedule.filter((_, i) => i !== index));
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || '';
  };

  return (
    <div className="space-y-4">
      {schedule.length > 0 && (
        <div className="space-y-2">
          {schedule.map((item, index) => (
            <Card key={index} className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium min-w-[80px]">
                  {getDayLabel(item.dayOfWeek)}
                </span>
                <span className="text-muted-foreground">
                  {item.startTime} - {item.endTime}
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeScheduleItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">요일</label>
              <Select
                value={newItem.dayOfWeek.toString()}
                onValueChange={(value) =>
                  setNewItem({ ...newItem, dayOfWeek: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DAYS_OF_WEEK.map((day) => (
                    <SelectItem key={day.value} value={day.value.toString()}>
                      {day.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">시작 시간</label>
              <Input
                type="time"
                value={newItem.startTime}
                onChange={(e) =>
                  setNewItem({ ...newItem, startTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">종료 시간</label>
              <Input
                type="time"
                value={newItem.endTime}
                onChange={(e) =>
                  setNewItem({ ...newItem, endTime: e.target.value })
                }
              />
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addScheduleItem}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            일정 추가
          </Button>
        </div>
      </Card>
    </div>
  );
}
