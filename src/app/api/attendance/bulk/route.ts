import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, writeDatabase } from '@/lib/storage';
import { generateId, isHoliday } from '@/lib/utils';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { attendanceBulkSchema } from '@/lib/validations';
import type { Attendance } from '@/types';

// ========================================
// POST /api/attendance/bulk
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = attendanceBulkSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { classId, date, records } = validation.data;
    const db = readDatabase();

    // 1. Check if the date is a holiday
    const holiday = isHoliday(date, db.holidays);
    if (holiday) {
      return NextResponse.json(
        {
          error: '휴일에는 출석 체크를 할 수 없습니다.',
          code: 'HOLIDAY_NOT_ALLOWED',
          holiday,
        },
        { status: 409 }
      );
    }

    // 2. Check if class exists
    const classData = db.classes.find((c) => c.id === classId);
    if (!classData) {
      return errorResponse('반을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // 3. Process each attendance record
    const createdAttendances: Attendance[] = [];
    const skippedStudents: string[] = [];

    for (const record of records) {
      const { studentId, status, notes } = record;

      // Check for duplicate attendance (same classId + date + studentId)
      const existingAttendance = db.attendances.find(
        (a) => a.classId === classId && a.date === date && a.studentId === studentId
      );

      if (existingAttendance) {
        // Skip this student
        skippedStudents.push(studentId);
        continue;
      }

      // Create new attendance record
      const newAttendance: Attendance = {
        id: generateId(),
        classId,
        studentId,
        date,
        status,
        notes,
      };

      db.attendances.push(newAttendance);
      createdAttendances.push(newAttendance);
    }

    // 4. Save database
    writeDatabase(db);

    // 5. Return response
    if (skippedStudents.length > 0) {
      return NextResponse.json(
        {
          data: createdAttendances,
          message: '출석이 저장되었습니다.',
          warning: `일부 수강생은 이미 출석 체크되어 건너뛰었습니다. (${skippedStudents.length}명)`,
          skipped: skippedStudents,
        },
        { status: 200 }
      );
    }

    return successResponse(createdAttendances, '출석이 저장되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/attendance/bulk error:', error);
    return errorResponse('출석 체크에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
