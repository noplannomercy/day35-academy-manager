import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, getById, update, remove } from '@/lib/storage';
import {
  successResponse,
  errorResponse,
  notFoundResponse,
  conflictResponse,
  hasActiveEnrollments,
} from '@/lib/api-utils';
import { studentUpdateSchema } from '@/lib/validations';
import type { Student, Enrollment, Class, Payment, Consultation, Waitlist, Attendance } from '@/types';

// ========================================
// GET /api/students/[id]
// ========================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // Find student
    const student = getById(db, 'students', id);
    if (!student) {
      return notFoundResponse('수강생을 찾을 수 없습니다.');
    }

    // Get student's enrollments with class details
    const enrollments = db.enrollments.filter((enrollment) => enrollment.studentId === id);
    const enrollmentDetails = enrollments.map((enrollment) => {
      const classInfo = db.classes.find((cls) => cls.id === enrollment.classId);

      // Calculate attendance rate
      const attendanceRecords = db.attendances.filter(
        (attendance) =>
          attendance.studentId === id &&
          attendance.classId === enrollment.classId
      );

      let attendanceRate = 0;
      if (attendanceRecords.length > 0) {
        const presentCount = attendanceRecords.filter(
          (record) => record.status === 'present'
        ).length;
        attendanceRate = Math.round((presentCount / attendanceRecords.length) * 100);
      }

      return {
        enrollment,
        class: classInfo || null,
        attendanceRate,
      };
    });

    // Get student's payments
    const payments = db.payments.filter((payment) => payment.studentId === id);

    // Get student's consultations
    const consultations = db.consultations.filter((consultation) => consultation.studentId === id);

    // Get student's waitlist entries
    const waitlists = db.waitlists.filter((waitlist) => waitlist.studentId === id);

    return NextResponse.json({
      data: {
        student,
        enrollments: enrollmentDetails,
        payments,
        consultations,
        waitlists,
      },
    });
  } catch (error) {
    console.error('GET /api/students/[id] error:', error);
    return errorResponse('수강생 정보를 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// PUT /api/students/[id]
// ========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = studentUpdateSchema.safeParse(body);
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

    // Check if student exists
    const existingStudent = getById(db, 'students', id);
    if (!existingStudent) {
      return notFoundResponse('수강생을 찾을 수 없습니다.');
    }

    // Prepare update data
    const updateData: Partial<Student> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.parentPhone !== undefined) updateData.parentPhone = data.parentPhone;
    if (data.email !== undefined) updateData.email = data.email || undefined;
    if (data.birthDate !== undefined) updateData.birthDate = data.birthDate || undefined;
    if (data.levelId !== undefined) updateData.levelId = data.levelId;
    if (data.sourceId !== undefined) updateData.sourceId = data.sourceId;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Update student
    const updatedStudent = update('students', id, updateData);

    if (!updatedStudent) {
      return errorResponse('수강생 정보 수정에 실패했습니다.', 'INTERNAL_ERROR', 500);
    }

    return successResponse(updatedStudent, '수강생 정보가 수정되었습니다.');
  } catch (error) {
    console.error('PUT /api/students/[id] error:', error);
    return errorResponse('수강생 정보 수정에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// DELETE /api/students/[id]
// ========================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const db = readDatabase();

    // Check if student exists
    const student = getById(db, 'students', id);
    if (!student) {
      return notFoundResponse('수강생을 찾을 수 없습니다.');
    }

    // Check for active enrollments
    if (hasActiveEnrollments(id, db.enrollments)) {
      return conflictResponse(
        '활성 수강 중인 반이 있어 삭제할 수 없습니다.',
        'ACTIVE_ENROLLMENT_EXISTS'
      );
    }

    // Delete student
    const deleted = remove('students', id);

    if (!deleted) {
      return errorResponse('수강생 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({
      message: '수강생이 삭제되었습니다.',
    });
  } catch (error) {
    console.error('DELETE /api/students/[id] error:', error);
    return errorResponse('수강생 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
