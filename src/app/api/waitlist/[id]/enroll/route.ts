import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, transaction } from '@/lib/storage';
import { generateId, getCurrentDate } from '@/lib/utils';
import { errorResponse, getClassCurrentStudents } from '@/lib/api-utils';
import type { Enrollment } from '@/types';

// ========================================
// PATCH /api/waitlist/[id]/enroll
// ========================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    // Use transaction to ensure both operations succeed or fail together
    const result = transaction((db) => {
      // 1. Find waitlist entry
      const waitlist = db.waitlists.find((w) => w.id === id);
      if (!waitlist) {
        throw new Error('NOT_FOUND:대기 등록을 찾을 수 없습니다.');
      }

      // 2. Check if waitlist status is waiting
      if (waitlist.status !== 'waiting') {
        throw new Error('INVALID_STATUS:대기중 상태가 아닙니다.');
      }

      // 3. Check if student exists
      const student = db.students.find((s) => s.id === waitlist.studentId);
      if (!student) {
        throw new Error('NOT_FOUND:수강생을 찾을 수 없습니다.');
      }

      // 4. Check if student is withdrawn
      if (student.status === 'withdrawn') {
        throw new Error('STUDENT_WITHDRAWN:퇴원한 수강생은 수강 전환할 수 없습니다.');
      }

      // 5. Check if class exists
      const classData = db.classes.find((c) => c.id === waitlist.classId);
      if (!classData) {
        throw new Error('NOT_FOUND:반을 찾을 수 없습니다.');
      }

      // 6. Check if class is closed
      if (classData.status === 'closed') {
        throw new Error('CLASS_CLOSED:종료된 반에는 수강 전환할 수 없습니다.');
      }

      // 7. Check class capacity
      const currentStudents = getClassCurrentStudents(waitlist.classId, db.enrollments);
      if (currentStudents >= classData.maxStudents) {
        throw new Error('CLASS_STILL_FULL:아직 정원에 여유가 없습니다.');
      }

      // 8. Check for duplicate enrollment (same student + same class + active)
      const existingEnrollment = db.enrollments.find(
        (e) =>
          e.studentId === waitlist.studentId &&
          e.classId === waitlist.classId &&
          e.status === 'active'
      );

      if (existingEnrollment) {
        throw new Error('DUPLICATE_ENROLLMENT:이미 해당 반에 수강 등록되어 있습니다.');
      }

      // 9. Create enrollment
      const newEnrollment: Enrollment = {
        id: generateId(),
        studentId: waitlist.studentId,
        classId: waitlist.classId,
        enrollDate: getCurrentDate(),
        status: 'active',
      };

      db.enrollments.push(newEnrollment);

      // 10. Update waitlist status to enrolled
      const waitlistIndex = db.waitlists.findIndex((w) => w.id === id);
      db.waitlists[waitlistIndex] = {
        ...waitlist,
        status: 'enrolled',
        enrolledAt: new Date().toISOString(),
      };

      const updatedWaitlist = db.waitlists[waitlistIndex];

      return {
        db,
        result: {
          waitlist: updatedWaitlist,
          enrollment: newEnrollment,
        },
      };
    });

    return NextResponse.json({
      data: result,
      message: '수강 전환이 완료되었습니다.',
    });
  } catch (error) {
    console.error('PATCH /api/waitlist/[id]/enroll error:', error);

    // Handle custom error messages from transaction
    if (error instanceof Error) {
      const [code, message] = error.message.split(':');

      if (code === 'NOT_FOUND') {
        return errorResponse(message || '리소스를 찾을 수 없습니다.', 'NOT_FOUND', 404);
      }

      if (code === 'CLASS_STILL_FULL') {
        return errorResponse(message || '아직 정원에 여유가 없습니다.', 'CLASS_STILL_FULL', 409);
      }

      if (code === 'INVALID_STATUS') {
        return errorResponse(message || '상태가 유효하지 않습니다.', 'VALIDATION_ERROR', 400);
      }

      if (code === 'STUDENT_WITHDRAWN') {
        return errorResponse(
          message || '퇴원한 수강생입니다.',
          'STUDENT_WITHDRAWN',
          400
        );
      }

      if (code === 'CLASS_CLOSED') {
        return errorResponse(message || '종료된 반입니다.', 'CLASS_CLOSED', 400);
      }

      if (code === 'DUPLICATE_ENROLLMENT') {
        return errorResponse(
          message || '이미 수강 등록되어 있습니다.',
          'DUPLICATE_ENROLLMENT',
          409
        );
      }
    }

    return errorResponse('수강 전환에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
