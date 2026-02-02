import { NextRequest, NextResponse } from 'next/server';
import { update } from '@/lib/storage';
import { errorResponse, successResponse } from '@/lib/api-utils';
import { attendanceUpdateSchema } from '@/lib/validations';

// ========================================
// PUT /api/attendance/[id]
// ========================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = attendanceUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { status, notes } = validation.data;

    // Update attendance record
    const updatedAttendance = update('attendances', id, {
      status,
      notes,
    });

    if (!updatedAttendance) {
      return errorResponse('출석 기록을 찾을 수 없습니다.', 'NOT_FOUND', 404);
    }

    return successResponse(updatedAttendance, '출석 상태가 수정되었습니다.');
  } catch (error) {
    console.error('PUT /api/attendance/[id] error:', error);
    return errorResponse('출석 상태 수정에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
