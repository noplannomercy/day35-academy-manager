import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, update, remove } from '@/lib/storage';
import { checkScheduleConflict, getCurrentDate } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  classHasActiveEnrollments,
} from '@/lib/api-utils';
import { classUpdateSchema } from '@/lib/validations';
import type { Class } from '@/types';

// ========================================
// GET /api/classes/[id]
// ========================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // Find class
    const classData = db.classes.find((c) => c.id === id);
    if (!classData) {
      return notFoundResponse('반을 찾을 수 없습니다.');
    }

    // Get instructor, subject, room
    const instructor = db.instructors.find((i) => i.id === classData.instructorId);
    const subject = db.settings.subjects.find((s) => s.id === classData.subjectId);
    const room = classData.roomId
      ? db.settings.rooms.find((r) => r.id === classData.roomId)
      : undefined;

    // Get active enrollments with student data
    const activeEnrollments = db.enrollments.filter(
      (e) => e.classId === id && e.status === 'active'
    );

    const enrichedEnrollments = activeEnrollments.map((enrollment) => {
      const student = db.students.find((s) => s.id === enrollment.studentId);

      // Calculate attendance rate
      const attendances = db.attendances.filter(
        (a) => a.studentId === enrollment.studentId && a.classId === id
      );
      const presentCount = attendances.filter((a) => a.status === 'present').length;
      const attendanceRate = attendances.length > 0 ? (presentCount / attendances.length) * 100 : 0;

      // Get this month's payment status
      const currentMonth = getCurrentDate().substring(0, 7); // YYYY-MM
      const payment = db.payments.find(
        (p) =>
          p.studentId === enrollment.studentId &&
          p.classId === id &&
          p.month === currentMonth
      );

      return {
        enrollment,
        student,
        attendanceRate: Math.round(attendanceRate),
        paymentStatus: payment?.status || 'unpaid',
      };
    });

    // Get waitlist
    const waitlist = db.waitlists.filter((w) => w.classId === id && w.status === 'waiting');
    const enrichedWaitlist = waitlist
      .sort((a, b) => a.priority - b.priority)
      .map((w) => {
        const student = db.students.find((s) => s.id === w.studentId);
        return {
          waitlist: w,
          student,
        };
      });

    // Get recent attendance (last 10)
    const recentAttendance = db.attendances
      .filter((a) => a.classId === id)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);

    return successResponse({
      class: classData,
      instructor,
      subject,
      room,
      enrollments: enrichedEnrollments,
      waitlist: enrichedWaitlist,
      recentAttendance,
    });
  } catch (error) {
    console.error('GET /api/classes/[id] error:', error);
    return errorResponse('반 정보를 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// PUT /api/classes/[id]
// ========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = classUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;
    const db = readDatabase();

    // Find existing class
    const existingClass = db.classes.find((c) => c.id === id);
    if (!existingClass) {
      return notFoundResponse('반을 찾을 수 없습니다.');
    }

    // If schedule is being updated, check for conflicts
    if (data.schedule || data.instructorId || data.roomId) {
      const scheduleToCheck = data.schedule || existingClass.schedule;
      const instructorIdToCheck = data.instructorId || existingClass.instructorId;
      const roomIdToCheck = data.roomId !== undefined ? data.roomId : existingClass.roomId;

      const conflicts = checkScheduleConflict(
        scheduleToCheck,
        db.classes,
        instructorIdToCheck,
        roomIdToCheck,
        id // Exclude current class from conflict check
      );

      if (conflicts.length > 0) {
        const instructorConflicts = conflicts.filter((c) => c.type === 'instructor');
        const roomConflicts = conflicts.filter((c) => c.type === 'room');

        if (instructorConflicts.length > 0) {
          return NextResponse.json(
            {
              error: '시간표 충돌이 발생했습니다.',
              code: 'INSTRUCTOR_SCHEDULE_CONFLICT',
              conflicts,
            },
            { status: 409 }
          );
        }

        if (roomConflicts.length > 0) {
          return NextResponse.json(
            {
              error: '시간표 충돌이 발생했습니다.',
              code: 'ROOM_SCHEDULE_CONFLICT',
              conflicts,
            },
            { status: 409 }
          );
        }
      }
    }

    // Update class
    const updatedClass = update('classes', id, data);

    if (!updatedClass) {
      return notFoundResponse('반을 찾을 수 없습니다.');
    }

    return successResponse(updatedClass, '반 정보가 수정되었습니다.');
  } catch (error) {
    console.error('PUT /api/classes/[id] error:', error);
    return errorResponse('반 수정에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// DELETE /api/classes/[id]
// ========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // Find class
    const classData = db.classes.find((c) => c.id === id);
    if (!classData) {
      return notFoundResponse('반을 찾을 수 없습니다.');
    }

    // Check if class has active enrollments
    if (classHasActiveEnrollments(id, db.enrollments)) {
      return errorResponse(
        '수강 중인 학생이 있어 삭제할 수 없습니다.',
        'ACTIVE_ENROLLMENT_EXISTS',
        409
      );
    }

    // Delete class
    const deleted = remove('classes', id);

    if (!deleted) {
      return notFoundResponse('반을 찾을 수 없습니다.');
    }

    return successResponse(null, '반이 삭제되었습니다.');
  } catch (error) {
    console.error('DELETE /api/classes/[id] error:', error);
    return errorResponse('반 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
