import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { isHoliday } from '@/lib/utils';
import {
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import type { Attendance, AttendanceStatus } from '@/types';

// ========================================
// GET /api/attendance
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const studentId = searchParams.get('studentId');
    const { page, limit } = getPaginationParams(searchParams);

    // classId is required
    if (!classId || classId.trim() === '') {
      return errorResponse('반을 선택하세요.', 'VALIDATION_ERROR', 400);
    }

    // Filter attendances by classId
    let filteredAttendances = db.attendances.filter((a) => a.classId === classId);

    // Apply date filter (exact date)
    if (date && date.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.date === date);
    }

    // Apply date range filter
    if (startDate && startDate.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.date >= startDate);
    }
    if (endDate && endDate.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.date <= endDate);
    }

    // Apply studentId filter
    if (studentId && studentId.trim() !== '') {
      filteredAttendances = filteredAttendances.filter((a) => a.studentId === studentId);
    }

    // Get total count before pagination
    const total = filteredAttendances.length;

    // Apply pagination
    const paginatedAttendances = paginateArray(filteredAttendances, page, limit);

    // Enrich with student data
    const enrichedData = paginatedAttendances.map((attendance) => {
      const student = db.students.find((s) => s.id === attendance.studentId);

      return {
        attendance,
        student,
      };
    });

    // Create pagination metadata
    const pagination = createPagination(total, page, limit);

    // Check if the specified date is a holiday
    let isHolidayDate = false;
    let holidayName: string | undefined;

    if (date && date.trim() !== '') {
      const holiday = isHoliday(date, db.holidays);
      if (holiday) {
        isHolidayDate = true;
        holidayName = holiday.name;
      }
    }

    return NextResponse.json({
      data: enrichedData,
      pagination,
      isHoliday: isHolidayDate,
      holidayName,
    });
  } catch (error) {
    console.error('GET /api/attendance error:', error);
    return errorResponse('출석 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
