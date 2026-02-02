import { NextRequest, NextResponse } from 'next/server';
import { readDatabase, create } from '@/lib/storage';
import { generateId, getCurrentDateTime, findById } from '@/lib/utils';
import {
  successResponse,
  errorResponse,
  getPaginationParams,
  createPagination,
  paginateArray,
  validationErrorResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import type { Consultation } from '@/types';
import { z } from 'zod';

// ========================================
// Validation Schema
// ========================================

const consultationCreateSchema = z.object({
  studentId: z.string().min(1, '수강생을 선택하세요.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '올바른 날짜 형식이 아닙니다.'),
  type: z.enum(['phone', 'visit', 'online']),
  content: z.string().min(1, '상담 내용을 입력하세요.'),
  nextAction: z.string().optional(),
  nextActionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
});

// ========================================
// GET /api/consultations
// ========================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const db = readDatabase();

    // Extract query parameters
    const studentId = searchParams.get('studentId');
    const { page, limit } = getPaginationParams(searchParams);

    // Filter consultations
    let filteredConsultations = [...db.consultations];

    // Apply studentId filter
    if (studentId && studentId.trim() !== '') {
      filteredConsultations = filteredConsultations.filter((c) => c.studentId === studentId);
    }

    // Sort by date descending (newest first)
    filteredConsultations.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });

    // Get total count before pagination
    const total = filteredConsultations.length;

    // Apply pagination
    const paginatedConsultations = paginateArray(filteredConsultations, page, limit);

    // Enrich with student data
    const enrichedConsultations = paginatedConsultations.map((consultation) => {
      const student = findById(db.students, consultation.studentId);
      return {
        consultation,
        student: student
          ? {
              id: student.id,
              name: student.name,
              phone: student.phone,
              status: student.status,
            }
          : null,
      };
    });

    // Create pagination metadata
    const pagination = createPagination(total, page, limit);

    return NextResponse.json({
      data: enrichedConsultations,
      pagination,
    });
  } catch (error) {
    console.error('GET /api/consultations error:', error);
    return errorResponse('상담 목록을 불러오는데 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}

// ========================================
// POST /api/consultations
// ========================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = consultationCreateSchema.safeParse(body);
    if (!validation.success) {
      return validationErrorResponse(
        '입력 데이터가 유효하지 않습니다.',
        validation.error.issues
      );
    }

    const data = validation.data;

    // Verify student exists
    const db = readDatabase();
    const student = findById(db.students, data.studentId);
    if (!student) {
      return notFoundResponse('수강생을 찾을 수 없습니다.');
    }

    // Create new consultation
    const newConsultation: Consultation = {
      id: generateId(),
      studentId: data.studentId,
      date: data.date,
      type: data.type,
      content: data.content,
      nextAction: data.nextAction || undefined,
      nextActionDate: data.nextActionDate || undefined,
      createdAt: getCurrentDateTime(),
    };

    // Save to database
    create('consultations', newConsultation);

    return successResponse(newConsultation, '상담 기록이 등록되었습니다.', 201);
  } catch (error) {
    console.error('POST /api/consultations error:', error);
    return errorResponse('상담 등록에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
