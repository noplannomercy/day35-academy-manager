import { NextRequest, NextResponse } from 'next/server';
import { readDatabase } from '@/lib/storage';
import { successResponse, errorResponse } from '@/lib/api-utils';
import type { ApiResponse } from '@/types';

// ========================================
// GET /api/instructor-salaries/stats
// ========================================

export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear();

    const db = readDatabase();

    // Filter salaries by year
    const yearPrefix = `${year}-`;
    const yearSalaries = db.instructorSalaries.filter((s) => s.month.startsWith(yearPrefix));

    // Initialize data for all 12 months
    const monthlyStats: {
      month: string;
      totalAmount: number;
      paidAmount: number;
      unpaidAmount: number;
      instructorCount: number;
    }[] = [];

    for (let month = 1; month <= 12; month++) {
      const monthStr = `${year}-${String(month).padStart(2, '0')}`;
      const monthSalaries = yearSalaries.filter((s) => s.month === monthStr);

      // Get unique instructor count
      const uniqueInstructorIds = new Set(monthSalaries.map((s) => s.instructorId));

      const totalAmount = monthSalaries.reduce((sum, s) => sum + s.amount, 0);
      const paidAmount = monthSalaries
        .filter((s) => s.status === 'paid')
        .reduce((sum, s) => sum + s.amount, 0);
      const unpaidAmount = monthSalaries
        .filter((s) => s.status === 'unpaid')
        .reduce((sum, s) => sum + s.amount, 0);

      monthlyStats.push({
        month: monthStr,
        totalAmount,
        paidAmount,
        unpaidAmount,
        instructorCount: uniqueInstructorIds.size,
      });
    }

    // Calculate year total
    const yearTotal = {
      totalAmount: yearSalaries.reduce((sum, s) => sum + s.amount, 0),
      paidAmount: yearSalaries
        .filter((s) => s.status === 'paid')
        .reduce((sum, s) => sum + s.amount, 0),
    };

    return NextResponse.json({
      data: monthlyStats,
      yearTotal,
    });
  } catch (error) {
    console.error('GET /api/instructor-salaries/stats error:', error);
    return errorResponse('급여 통계 조회에 실패했습니다.', 'INTERNAL_ERROR', 500);
  }
}
