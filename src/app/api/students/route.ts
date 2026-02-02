import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDate, getCurrentDateTime } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
} from '@/lib/api-utils';
import { studentCreateSchema } from '@/lib/validations';
import type { Student } from '@/types';

// ========================================
// GET /api/students
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const levelId = searchParams.get('levelId');
    const { page, limit } = getPaginationParams(searchParams);

    // Filter students
    let filteredStudents = [...db.students];

    // Apply search filter (name or phone)
    if (search && search.trim() !== '') {
      const searchLower = search.toLowerCase();
      filteredStudents = filteredStudents.filter(
        (student) =>
          student.name.toLowerCase().includes(searchLower) ||
          student.phone.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (status && (status === 'active' || status === 'inactive' || status === 'withdrawn')) {
      filteredStudents = filteredStudents.filter((student) => student.status === status);
    }

    // Apply levelId filter
    if (levelId && levelId.trim() !== '') {
      filteredStudents = filteredStudents.filter((student) => student.levelId === levelId);
    }

    // Get total count before pagination
    const total = filteredStudents.length;

    // Apply pagination
    const paginatedStudents = paginateArray(filteredStudents, page, limit);

    // Create pagination metadata
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: paginatedStudents,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/students error:', error);
    return errorResponse('수강생 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/students
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = studentCreateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const data = validation.data;

    // Create new student
    const newStudent: Student = {
      id: generateId(),
      name: data.name,
      phone: data.phone,
      parentPhone: data.parentPhone,
      email: data.email || undefined,
      birthDate: data.birthDate || undefined,
      levelId: data.levelId,
      sourceId: data.sourceId,
      status: 'active',
      enrollDate: getCurrentDate(),
      notes: data.notes,
      createdAt: getCurrentDateTime(),
    };

    // Save to database
    create('students', newStudent);

    return successResponse(newStudent, '수강생이 등록되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/students error:', error);
    return errorResponse('수강생 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
