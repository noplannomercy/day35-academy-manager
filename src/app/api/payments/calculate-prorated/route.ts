import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { calculateProrated } from '@/lib/utils';
import { paymentProratedSchema } from '@/lib/validations';
import {
  errorResponse,
  notFoundResponse,
} from '@/lib/api-utils';
import type { ApiResponse } from '@/types';

// ========================================
// POST /api/payments/calculate-prorated
// ========================================

export async function POST(
  request: NextRequest
): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate request body
    const validation = paymentProratedSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(
        '입력 데이터가 유효하지 않습니다.',
        'VALIDATION_ERROR',
        400,
        validation.error.issues
      );
    }

    const { classId, enrollDate, month } = validation.data;
    const db = readDatabase();

    // Find class
    const cls = db.classes.find((c) => c.id === classId);
    if (!cls) {
      return notFoundResponse('존재하지 않는 반입니다.');
    }

    // Calculate prorated amount
    const result = calculateProrated(
      cls.monthlyFee,
      enrollDate,
      month,
      cls.schedule
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/payments/calculate-prorated error:', error);
    return errorResponse('일할계산에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
