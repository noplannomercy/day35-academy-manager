import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from 'uuid';
import { format, parseISO, startOfDay, endOfDay, eachDayOfInterval, getDay } from 'date-fns';
import type { Schedule, Class, Holiday } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========================================
// ID Generation
// ========================================

export function generateId(): string {
  return uuidv4();
}

// ========================================
// Date Utilities
// ========================================

export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getCurrentDateTime(): string {
  return new Date().toISOString();
}

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
}

export function formatDateTime(dateTime: string | Date): string {
  const dateObj = typeof dateTime === 'string' ? parseISO(dateTime) : dateTime;
  return format(dateObj, 'yyyy-MM-dd HH:mm:ss');
}

export function isHoliday(date: string, holidays: Holiday[]): Holiday | undefined {
  return holidays.find((h) => h.date === date);
}

// ========================================
// Schedule Utilities
// ========================================

export interface ConflictResult {
  type: 'instructor' | 'room';
  existingClass: string;
  dayOfWeek: number;
  time: string;
}

export function checkScheduleConflict(
  schedule: Schedule[],
  existingClasses: Class[],
  instructorId?: string,
  roomId?: string,
  excludeClassId?: string
): ConflictResult[] {
  const conflicts: ConflictResult[] = [];

  for (const slot of schedule) {
    for (const existingClass of existingClasses) {
      // Skip if it's the same class being edited
      if (excludeClassId && existingClass.id === excludeClassId) {
        continue;
      }

      // Skip if class is closed
      if (existingClass.status === 'closed') {
        continue;
      }

      // Check instructor conflict
      if (instructorId && existingClass.instructorId === instructorId) {
        for (const existingSlot of existingClass.schedule) {
          if (existingSlot.dayOfWeek === slot.dayOfWeek) {
            if (timeOverlap(slot.startTime, slot.endTime, existingSlot.startTime, existingSlot.endTime)) {
              conflicts.push({
                type: 'instructor',
                existingClass: existingClass.name,
                dayOfWeek: slot.dayOfWeek,
                time: `${slot.startTime}-${slot.endTime}`,
              });
            }
          }
        }
      }

      // Check room conflict
      if (roomId && existingClass.roomId === roomId) {
        for (const existingSlot of existingClass.schedule) {
          if (existingSlot.dayOfWeek === slot.dayOfWeek) {
            if (timeOverlap(slot.startTime, slot.endTime, existingSlot.startTime, existingSlot.endTime)) {
              conflicts.push({
                type: 'room',
                existingClass: existingClass.name,
                dayOfWeek: slot.dayOfWeek,
                time: `${slot.startTime}-${slot.endTime}`,
              });
            }
          }
        }
      }
    }
  }

  return conflicts;
}

function timeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const [h1, m1] = start1.split(':').map(Number);
  const [h2, m2] = end1.split(':').map(Number);
  const [h3, m3] = start2.split(':').map(Number);
  const [h4, m4] = end2.split(':').map(Number);

  const minutes1Start = h1 * 60 + m1;
  const minutes1End = h2 * 60 + m2;
  const minutes2Start = h3 * 60 + m3;
  const minutes2End = h4 * 60 + m4;

  return minutes1Start < minutes2End && minutes2Start < minutes1End;
}

// ========================================
// Prorated Calculation
// ========================================

export function calculateProrated(
  monthlyFee: number,
  enrollDate: string,
  month: string,
  schedule: Schedule[]
): {
  originalAmount: number;
  proratedAmount: number;
  totalClassDays: number;
  remainingDays: number;
  calculationDetails: string;
} {
  const [year, monthNum] = month.split('-').map(Number);
  const enrollDateObj = parseISO(enrollDate);

  // Get all days in the month
  const firstDayOfMonth = new Date(year, monthNum - 1, 1);
  const lastDayOfMonth = new Date(year, monthNum, 0);

  // Get class days of week from schedule
  const classDaysOfWeek = schedule.map((s) => s.dayOfWeek);

  // Count total class days in the month
  const allDaysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const totalClassDays = allDaysInMonth.filter((day) => classDaysOfWeek.includes(getDay(day))).length;

  // Count remaining class days from enrollment date
  const remainingDaysInMonth = eachDayOfInterval({
    start: enrollDateObj,
    end: lastDayOfMonth,
  });

  const remainingClassDays = remainingDaysInMonth.filter((day) =>
    classDaysOfWeek.includes(getDay(day))
  ).length;

  // Calculate prorated amount
  const proratedAmount = Math.round((monthlyFee / totalClassDays) * remainingClassDays);

  const calculationDetails = `${month} 총 수업일 ${totalClassDays}일 중 ${remainingClassDays}일 수강 (${enrollDate} 등록)`;

  return {
    originalAmount: monthlyFee,
    proratedAmount,
    totalClassDays,
    remainingDays: remainingClassDays,
    calculationDetails,
  };
}

// ========================================
// Number Formatting
// ========================================

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

// ========================================
// Array Utilities
// ========================================

export function findById<T extends { id: string }>(items: T[], id: string): T | undefined {
  return items.find((item) => item.id === id);
}

export function findByIds<T extends { id: string }>(items: T[], ids: string[]): T[] {
  return items.filter((item) => ids.includes(item.id));
}

// ========================================
// Pagination Utilities
// ========================================

export function paginate<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return items.slice(start, end);
}

export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}
