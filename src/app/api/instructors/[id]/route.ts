import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, update, remove } from '@/lib/storage';
import { instructorUpdateSchema } from '@/lib/validations';
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
  notFoundResponse,
  conflictResponse,
  hasActiveClasses,
} from '@/lib/api-utils';
import type { Instructor, ApiResponse } from '@/types';

// ========================================
// PUT /api/instructors/[id]
// ========================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<Instructor>>> {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate request body
    const validation = instructorUpdateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;

    // Check if instructor exists
    const db = readDatabase();
    const instructor = db.instructors.find((i) => i.id === id);
    if (!instructor) {
      return notFoundResponse('강사를 찾을 수 없습니다.');
    }

    // Verify subjects exist if subjectIds provided
    if (data.subjectIds) {
      const validSubjects = data.subjectIds.every((subjectId) =>
        db.settings.subjects.some((s) => s.id === subjectId)
      );

      if (!validSubjects) {
        return validationErrorResponse('유효하지 않은 과목이 포함되어 있습니다.');
      }
    }

    // Update instructor
    const updatedInstructor = update('instructors', id, data);
    if (!updatedInstructor) {
      return notFoundResponse('강사를 찾을 수 없습니다.');
    }

    return successResponse(updatedInstructor, '강사 정보가 수정되었습니다.');
  } catch (error) {
    console.error('PUT /api/instructors/[id] error:', error);
    return errorResponse('강사 정보 수정에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// DELETE /api/instructors/[id]
// ========================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<never>>> {
  try {
    const { id } = await params;

    // Check if instructor exists
    const db = readDatabase();
    const instructor = db.instructors.find((i) => i.id === id);
    if (!instructor) {
      return notFoundResponse('강사를 찾을 수 없습니다.');
    }

    // Check if instructor has active classes
    if (hasActiveClasses(id, db.classes)) {
      return conflictResponse('담당 중인 반이 있어 삭제할 수 없습니다.', 'ACTIVE_CLASS_EXISTS');
    }

    // Delete instructor
    const success = remove('instructors', id);
    if (!success) {
      return notFoundResponse('강사를 찾을 수 없습니다.');
    }

    return successResponse(null as never, '강사가 삭제되었습니다.');
  } catch (error) {
    console.error('DELETE /api/instructors/[id] error:', error);
    return errorResponse('강사 삭제에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
