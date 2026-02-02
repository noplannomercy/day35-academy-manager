import { NextResponse } from 'next/server';
import type { ApiResponse, Pagination, Payment } from '@/types';
import { ERROR_CODES, type ErrorCode } from './constants';
import { getCurrentDate } from './utils';

// ========================================
// Response Helpers
// ========================================

export function successResponse<T>(
  data: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  code: ErrorCode,
  status: number = 400,
  details?: any
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      error,
      code,
      ...(details && { details }),
    },
    { status }
  );
}

export function validationErrorResponse(
  message: string = '입력 데이터가 유효하지 않습니다.',
  details?: any
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 'VALIDATION_ERROR', 400, details);
}

export function notFoundResponse(
  message: string = '리소스를 찾을 수 없습니다.'
): NextResponse<ApiResponse<never>> {
  return errorResponse(message, 'NOT_FOUND', 404);
}

export function conflictResponse(
  error: string,
  code: ErrorCode,
  details?: any
): NextResponse<ApiResponse<never>> {
  return errorResponse(error, code, 409, details);
}

// ========================================
// Pagination Helpers
// ========================================

export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 10
): { page: number; limit: number } {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit), 10));
  return { page, limit };
}

export function createPagination(
  total: number,
  page: number,
  limit: number
): Pagination {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export function paginateArray<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  const end = start + limit;
  return items.slice(start, end);
}

// ========================================
// Payment Status Auto-Update
// ========================================

/**
 * Automatically update unpaid payments to overdue if the month has passed.
 * This should be called when fetching payment data.
 */
export function updateOverduePayments(payments: Payment[]): Payment[] {
  const today = getCurrentDate();
  const [currentYear, currentMonth] = today.split('-').map(Number);

  return payments.map((payment) => {
    if (payment.status === 'unpaid') {
      const [paymentYear, paymentMonth] = payment.month.split('-').map(Number);

      // Get last day of payment month
      const lastDayOfPaymentMonth = new Date(paymentYear, paymentMonth, 0);
      const lastDateStr = `${paymentYear}-${String(paymentMonth).padStart(2, '0')}-${String(
        lastDayOfPaymentMonth.getDate()
      ).padStart(2, '0')}`;

      // If today is past the last day of the payment month, mark as overdue
      if (today > lastDateStr) {
        return {
          ...payment,
          status: 'overdue' as const,
        };
      }
    }
    return payment;
  });
}

// ========================================
// Query Helpers
// ========================================

export function parseSearchParam(value: string | null): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}

export function parseBooleanParam(value: string | null, defaultValue: boolean = false): boolean {
  if (value === null) return defaultValue;
  return value === 'true' || value === '1';
}

export function parseNumberParam(
  value: string | null,
  defaultValue?: number
): number | undefined {
  if (value === null) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

// ========================================
// Validation Helpers
// ========================================

export function validateRequiredFields<T extends Record<string, any>>(
  data: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  for (const field of requiredFields) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      missingFields.push(String(field));
    }
  }

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

// ========================================
// Error Code Helpers
// ========================================

export function getErrorMessage(code: ErrorCode): string {
  return ERROR_CODES[code] || '알 수 없는 오류가 발생했습니다.';
}

// ========================================
// Date Validation Helpers
// ========================================

export function isValidDateFormat(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date);
}

export function isValidMonthFormat(month: string): boolean {
  return /^\d{4}-\d{2}$/.test(month);
}

export function isValidTimeFormat(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}

// ========================================
// Business Logic Helpers
// ========================================

/**
 * Calculate days overdue for a payment
 */
export function calculateDaysOverdue(paymentMonth: string): number {
  const today = getCurrentDate();
  const [year, month] = paymentMonth.split('-').map(Number);
  const lastDayOfMonth = new Date(year, month, 0);
  const lastDateStr = `${year}-${String(month).padStart(2, '0')}-${String(
    lastDayOfMonth.getDate()
  ).padStart(2, '0')}`;

  if (today <= lastDateStr) {
    return 0;
  }

  const lastDate = new Date(lastDateStr);
  const todayDate = new Date(today);
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Check if a student has any active enrollments
 */
export function hasActiveEnrollments(
  studentId: string,
  enrollments: Array<{ studentId: string; status: string }>
): boolean {
  return enrollments.some(
    (enrollment) => enrollment.studentId === studentId && enrollment.status === 'active'
  );
}

/**
 * Check if an instructor has any active classes
 */
export function hasActiveClasses(
  instructorId: string,
  classes: Array<{ instructorId: string; status: string }>
): boolean {
  return classes.some(
    (cls) => cls.instructorId === instructorId && cls.status === 'active'
  );
}

/**
 * Check if a class has any active enrollments
 */
export function classHasActiveEnrollments(
  classId: string,
  enrollments: Array<{ classId: string; status: string }>
): boolean {
  return enrollments.some(
    (enrollment) => enrollment.classId === classId && enrollment.status === 'active'
  );
}

/**
 * Get current number of students in a class
 */
export function getClassCurrentStudents(
  classId: string,
  enrollments: Array<{ classId: string; status: string }>
): number {
  return enrollments.filter(
    (enrollment) => enrollment.classId === classId && enrollment.status === 'active'
  ).length;
}

/**
 * Check if class is full
 */
export function isClassFull(
  classId: string,
  maxStudents: number,
  enrollments: Array<{ classId: string; status: string }>
): boolean {
  const currentStudents = getClassCurrentStudents(classId, enrollments);
  return currentStudents >= maxStudents;
}
