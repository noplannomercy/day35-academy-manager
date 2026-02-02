import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/storage';
import { generateId, getCurrentDateTime } from '@/lib/utils';
import { successResponse, errorResponse, validationErrorResponse } from '@/lib/api-utils';
import { KOREAN_PUBLIC_HOLIDAYS } from '@/lib/constants';
import type { Holiday } from '@/types';
import { z } from 'zod';

// ========================================
// Validation Schema
// ========================================

const initPublicHolidaysSchema = z.object({
  year: z.number().int().min(2024).max(2026, '2024-2026년만 지원됩니다.'),
});

// ========================================
// POST /api/holidays/init-public
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = initPublicHolidaysSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        '입력 데이터가 유효하지 않습니다.',
        validation.error.issues
      );
    }

    const { year } = validation.data;

    // Get public holidays for the year
    const publicHolidays = KOREAN_PUBLIC_HOLIDAYS[year as keyof typeof KOREAN_PUBLIC_HOLIDAYS];

    if (!publicHolidays) {
      return errorResponse(
        `${year}년의 공휴일 데이터가 없습니다.`,
        'VALIDATION_ERROR',
        400
      );
    }

    const db = readDatabase();
    const existingHolidayDates = new Set(db.holidays.map((h) => h.date));
    const newHolidays: Holiday[] = [];

    // Filter out duplicates and create new holidays
    for (const holiday of publicHolidays) {
      if (!existingHolidayDates.has(holiday.date)) {
        const newHoliday: Holiday = {
          id: generateId(),
          date: holiday.date,
          name: holiday.name,
          type: 'public',
          createdAt: getCurrentDateTime(),
        };
        newHolidays.push(newHoliday);
        existingHolidayDates.add(holiday.date);
      }
    }

    // Add all new holidays to database
    if (newHolidays.length > 0) {
      db.holidays.push(...newHolidays);
      writeDatabase(db);
    }

    const message =
      newHolidays.length === 0
        ? `${year}년 공휴일이 이미 모두 등록되어 있습니다.`
        : `${newHolidays.length}개의 공휴일이 등록되었습니다.`;

    return successResponse(
      {
        holidays: newHolidays,
        count: newHolidays.length,
        skipped: publicHolidays.length - newHolidays.length,
      },
      message,
      201
    );
  } catch (error) {
    console.error('POST /api/holidays/init-public error:', error);
    return errorResponse('공휴일 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
