import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { errorResponse } from '@/lib/api-utils';
import { enrollmentConflictCheckSchema } from '@/lib/validations';
import type { ConflictResult } from '@/types';

// ========================================
// POST /api/enrollments/check-conflict
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = enrollmentConflictCheckSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { studentId, classId } = validation.data;
    const db = readDatabase();

    // Find the target class
    const targetClass = db.classes.find((c) => c.id === classId);
    if (!targetClass) {
      return errorResponse('반을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    // Get student's active enrollments
    const studentActiveEnrollments = db.enrollments.filter(
      (e) => e.studentId === studentId && e.status === 'active'
    );

    const conflicts: ConflictResult[] = [];

    // Check for schedule conflicts
    for (const enrollment of studentActiveEnrollments) {
      const enrolledClass = db.classes.find((c) => c.id === enrollment.classId);
      if (!enrolledClass) continue;

      // Compare schedules
      for (const targetSlot of targetClass.schedule) {
        for (const existingSlot of enrolledClass.schedule) {
          if (targetSlot.dayOfWeek === existingSlot.dayOfWeek) {
            // Check time overlap
            const targetStart = timeToMinutes(targetSlot.startTime);
            const targetEnd = timeToMinutes(targetSlot.endTime);
            const existingStart = timeToMinutes(existingSlot.startTime);
            const existingEnd = timeToMinutes(existingSlot.endTime);

            if (targetStart < existingEnd && existingStart < targetEnd) {
              conflicts.push({
                type: 'student',
                classId: enrolledClass.id,
                className: enrolledClass.name,
                dayOfWeek: targetSlot.dayOfWeek,
                time: `${targetSlot.startTime}-${targetSlot.endTime}`,
              });
            }
          }
        }
      }
    }

    return NextResponse.json({
      hasConflict: conflicts.length > 0,
      conflicts,
    });
  } catch (error) {
    console.error('POST /api/enrollments/check-conflict error:', error);
    return errorResponse('충돌 검사에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// Helper Functions
// ========================================

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
