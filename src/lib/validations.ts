import { z } from 'zod';

// ========================================
// Common Schemas
// ========================================

const scheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
});

// ========================================
// Student Schemas
// ========================================

export const studentCreateSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  phone: z.string().min(1, '연락처를 입력하세요.'),
  parentPhone: z.string().optional(),
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  levelId: z.string().optional(),
  sourceId: z.string().optional(),
  notes: z.string().optional(),
});

export const studentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  parentPhone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
  levelId: z.string().optional(),
  sourceId: z.string().optional(),
  status: z.enum(['active', 'inactive', 'withdrawn']).optional(),
  notes: z.string().optional(),
});

// ========================================
// Instructor Schemas
// ========================================

export const instructorCreateSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요.'),
  phone: z.string().min(1, '연락처를 입력하세요.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.').optional().or(z.literal('')),
  subjectIds: z.array(z.string()).min(1, '최소 1개의 과목을 선택하세요.'),
  monthlySalary: z.number().nonnegative('급여는 0 이상이어야 합니다.').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notes: z.string().optional(),
});

export const instructorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional().or(z.literal('')),
  subjectIds: z.array(z.string()).min(1).optional(),
  monthlySalary: z.number().nonnegative().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  notes: z.string().optional(),
});

// ========================================
// Class Schemas
// ========================================

export const classCreateSchema = z.object({
  name: z.string().min(1, '반 이름을 입력하세요.'),
  subjectId: z.string().min(1, '과목을 선택하세요.'),
  instructorId: z.string().min(1, '강사를 선택하세요.'),
  maxStudents: z.number().int().min(1, '정원은 1명 이상이어야 합니다.'),
  schedule: z.array(scheduleSchema).min(1, '최소 1개의 시간표를 등록하세요.'),
  monthlyFee: z.number().nonnegative('수강료는 0원 이상이어야 합니다.'),
  roomId: z.string().optional(),
  notes: z.string().optional(),
});

export const classUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  subjectId: z.string().min(1).optional(),
  instructorId: z.string().min(1).optional(),
  maxStudents: z.number().int().min(1).optional(),
  schedule: z.array(scheduleSchema).min(1).optional(),
  monthlyFee: z.number().nonnegative().optional(),
  status: z.enum(['active', 'closed']).optional(),
  roomId: z.string().optional(),
  notes: z.string().optional(),
});

// ========================================
// Enrollment Schemas
// ========================================

export const enrollmentCreateSchema = z.object({
  studentId: z.string().min(1, '수강생을 선택하세요.'),
  classId: z.string().min(1, '반을 선택하세요.'),
});

export const enrollmentConflictCheckSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
});

// ========================================
// Attendance Schemas
// ========================================

export const attendanceBulkSchema = z.object({
  classId: z.string().min(1, '반을 선택하세요.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),
  records: z.array(
    z.object({
      studentId: z.string().min(1),
      status: z.enum(['present', 'absent', 'late', 'excused']),
      notes: z.string().optional(),
    })
  ).min(1, '최소 1명의 출석 정보를 입력하세요.'),
});

export const attendanceUpdateSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused']),
  notes: z.string().optional(),
});

// ========================================
// Payment Schemas
// ========================================

export const paymentCreateSchema = z.object({
  studentId: z.string().min(1, '수강생을 선택하세요.'),
  classId: z.string().min(1, '반을 선택하세요.'),
  amount: z.number().positive('금액은 0보다 커야 합니다.'),
  month: z.string().regex(/^\d{4}-\d{2}$/, '월 형식이 올바르지 않습니다.'),
  isProrated: z.boolean().optional(),
  notes: z.string().optional(),
});

export const paymentPaySchema = z.object({
  paymentType: z.enum(['full', 'half'], '납부 유형을 선택하세요.'),
  method: z.enum(['cash', 'card', 'transfer'], '납부 방법을 선택하세요.'),
});

export const paymentProratedSchema = z.object({
  classId: z.string().min(1),
  enrollDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

// ========================================
// Refund Schemas
// ========================================

export const refundCreateSchema = z.object({
  paymentId: z.string().min(1, '수납 건을 선택하세요.'),
  amount: z.number().positive('환불 금액은 0보다 커야 합니다.'),
  reason: z.string().min(1, '환불 사유를 입력하세요.'),
});

// ========================================
// Consultation Schemas
// ========================================

export const consultationCreateSchema = z.object({
  studentId: z.string().min(1, '수강생을 선택하세요.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),
  type: z.enum(['phone', 'visit', 'online'], '상담 유형을 선택하세요.'),
  content: z.string().min(1, '상담 내용을 입력하세요.'),
  nextAction: z.string().optional(),
  nextActionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')),
});

// ========================================
// MakeupClass Schemas
// ========================================

export const makeupClassCreateSchema = z.object({
  enrollmentId: z.string().min(1, '수강 정보를 선택하세요.'),
  absenceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '결석 날짜 형식이 올바르지 않습니다.'),
  scheduledDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '보강 날짜 형식이 올바르지 않습니다.'),
  scheduledTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, '시간 형식이 올바르지 않습니다.'),
});

export const makeupClassUpdateSchema = z.object({
  status: z.enum(['completed', 'cancelled']),
});

// ========================================
// Waitlist Schemas
// ========================================

export const waitlistCreateSchema = z.object({
  studentId: z.string().min(1, '수강생을 선택하세요.'),
  classId: z.string().min(1, '반을 선택하세요.'),
});

// ========================================
// InstructorSalary Schemas
// ========================================

export const instructorSalaryCreateSchema = z.object({
  instructorId: z.string().min(1, '강사를 선택하세요.'),
  month: z.string().regex(/^\d{4}-\d{2}$/, '월 형식이 올바르지 않습니다.'),
  amount: z.number().positive('급여는 0보다 커야 합니다.'),
  notes: z.string().optional(),
});

// ========================================
// Holiday Schemas
// ========================================

export const holidayCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '날짜 형식이 올바르지 않습니다.'),
  name: z.string().min(1, '휴일 이름을 입력하세요.'),
  type: z.enum(['public', 'manual'], '휴일 유형을 선택하세요.'),
});

export const holidayInitPublicSchema = z.object({
  year: z.number().int().min(2024).max(2030),
});

// ========================================
// Settings Schemas
// ========================================

export const settingsUpdateSchema = z.object({
  academyName: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  operatingHours: z.object({
    start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  }).optional(),
  levels: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1),
      order: z.number().int(),
    })
  ).optional(),
  subjects: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1),
    })
  ).optional(),
  rooms: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1),
    })
  ).optional(),
  sources: z.array(
    z.object({
      id: z.string(),
      name: z.string().min(1),
    })
  ).optional(),
});
