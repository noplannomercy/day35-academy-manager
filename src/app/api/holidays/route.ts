import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
  validationErrorResponse,
  conflictResponse,
} from '@/lib/api-utils';
import type { Holiday } from '@/types';
import { z } from 'zod';

// ========================================
// Validation Schema
// ========================================

const holidayCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.'),
  name: z.string().min(1, '휴일 이름을 입력하세요.'),
  type: z.enum(['public', 'manual']),
});

// ========================================
// GET /api/holidays
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const { page, limit } = getPaginationParams(searchParams);

    // Filter holidays
    let filteredHolidays = [...db.holidays];

    // Apply year filter
    if (year && year.trim() !== '') {
      filteredHolidays = filteredHolidays.filter((h) => h.date.startsWith(year));
    }

    // Apply month filter (YYYY-MM)
    if (month && month.trim() !== '') {
      filteredHolidays = filteredHolidays.filter((h) => h.date.startsWith(month));
    }

    // Sort by date ascending
    filteredHolidays.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateA - dateB;
    });

    // Get total count before pagination
    const total = filteredHolidays.length;

    // Apply pagination
    const paginatedHolidays = paginateArray(filteredHolidays, page, limit);

    // Create pagination metadata
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: paginatedHolidays,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/holidays error:', error);
    return errorResponse('휴일 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/holidays
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = holidayCreateSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        '입력 데이터가 유효하지 않습니다.',
        validation.error.issues
      );
    }

    const data = validation.data;

    // Check for duplicate holiday date
    const db = readDatabase();
    const existingHoliday = db.holidays.find((h) => h.date === data.date);
    if (existingHoliday) {
      return conflictResponse('이미 등록된 휴일입니다.', 'DUPLICATE_HOLIDAY');
    }

    // Create new holiday
    const newHoliday: Holiday = {
      id: generateId(),
      date: data.date,
      name: data.name,
      type: data.type,
      createdAt: getCurrentDateTime(),
    };

    // Save to database
    create('holidays', newHoliday);

    return successResponse(newHoliday, '휴일이 등록되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/holidays error:', error);
    return errorResponse('휴일 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
