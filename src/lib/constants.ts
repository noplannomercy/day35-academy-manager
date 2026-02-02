// ========================================
// Pagination
// ========================================

export const PAGE_SIZE = 10;

// ========================================
// Payment
// ========================================

export const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const;

export const PAYMENT_METHOD_LABELS = {
  cash: '현금',
  card: '카드',
  transfer: '계좌이체',
} as const;

export const PARTIAL_PAYMENT_RATIO = 0.5;

// ========================================
// Dashboard
// ========================================

export const DASHBOARD_RECENT_COUNT = 5;
export const DASHBOARD_UNPAID_LIMIT = 10;

// ========================================
// Status Labels
// ========================================

export const STUDENT_STATUS_LABELS = {
  active: '수강중',
  inactive: '일시중단',
  withdrawn: '퇴원',
} as const;

export const INSTRUCTOR_STATUS_LABELS = {
  active: '재직중',
  inactive: '퇴사',
} as const;

export const CLASS_STATUS_LABELS = {
  active: '진행중',
  closed: '종료',
} as const;

export const PAYMENT_STATUS_LABELS = {
  paid: '납부완료',
  partial: '부분납부',
  unpaid: '미납',
  overdue: '연체',
} as const;

export const ATTENDANCE_STATUS_LABELS = {
  present: '출석',
  absent: '결석',
  late: '지각',
  excused: '사유결석',
} as const;

export const ENROLLMENT_STATUS_LABELS = {
  active: '수강중',
  dropped: '수강취소',
} as const;

export const MAKEUP_STATUS_LABELS = {
  pending: '예약',
  completed: '완료',
  cancelled: '취소',
} as const;

export const WAITLIST_STATUS_LABELS = {
  waiting: '대기중',
  enrolled: '수강전환',
  cancelled: '취소',
} as const;

export const SALARY_STATUS_LABELS = {
  unpaid: '미지급',
  paid: '지급완료',
} as const;

export const HOLIDAY_TYPE_LABELS = {
  public: '공휴일',
  manual: '수동등록',
} as const;

export const CONSULTATION_TYPE_LABELS = {
  phone: '전화상담',
  visit: '방문상담',
  online: '온라인상담',
} as const;

// ========================================
// Day of Week
// ========================================

export const DAY_OF_WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
export const DAY_OF_WEEK_LABELS_FULL = [
  '일요일',
  '월요일',
  '화요일',
  '수요일',
  '목요일',
  '금요일',
  '토요일',
] as const;

// ========================================
// Korean Public Holidays (2024-2026)
// ========================================

export const KOREAN_PUBLIC_HOLIDAYS = {
  2024: [
    { date: '2024-01-01', name: '신정' },
    { date: '2024-02-09', name: '설날 연휴' },
    { date: '2024-02-10', name: '설날' },
    { date: '2024-02-11', name: '설날 연휴' },
    { date: '2024-02-12', name: '대체공휴일' },
    { date: '2024-03-01', name: '삼일절' },
    { date: '2024-05-05', name: '어린이날' },
    { date: '2024-05-06', name: '대체공휴일' },
    { date: '2024-05-15', name: '부처님오신날' },
    { date: '2024-06-06', name: '현충일' },
    { date: '2024-08-15', name: '광복절' },
    { date: '2024-09-16', name: '추석 연휴' },
    { date: '2024-09-17', name: '추석' },
    { date: '2024-09-18', name: '추석 연휴' },
    { date: '2024-10-03', name: '개천절' },
    { date: '2024-10-09', name: '한글날' },
    { date: '2024-12-25', name: '성탄절' },
  ],
  2025: [
    { date: '2025-01-01', name: '신정' },
    { date: '2025-01-28', name: '설날 연휴' },
    { date: '2025-01-29', name: '설날' },
    { date: '2025-01-30', name: '설날 연휴' },
    { date: '2025-03-01', name: '삼일절' },
    { date: '2025-05-05', name: '어린이날' },
    { date: '2025-05-05', name: '부처님오신날' },
    { date: '2025-06-06', name: '현충일' },
    { date: '2025-08-15', name: '광복절' },
    { date: '2025-10-03', name: '개천절' },
    { date: '2025-10-05', name: '추석 연휴' },
    { date: '2025-10-06', name: '추석' },
    { date: '2025-10-07', name: '추석 연휴' },
    { date: '2025-10-08', name: '대체공휴일' },
    { date: '2025-10-09', name: '한글날' },
    { date: '2025-12-25', name: '성탄절' },
  ],
  2026: [
    { date: '2026-01-01', name: '신정' },
    { date: '2026-02-16', name: '설날 연휴' },
    { date: '2026-02-17', name: '설날' },
    { date: '2026-02-18', name: '설날 연휴' },
    { date: '2026-03-01', name: '삼일절' },
    { date: '2026-03-02', name: '대체공휴일' },
    { date: '2026-05-05', name: '어린이날' },
    { date: '2026-05-24', name: '부처님오신날' },
    { date: '2026-06-06', name: '현충일' },
    { date: '2026-08-15', name: '광복절' },
    { date: '2026-08-17', name: '대체공휴일' },
    { date: '2026-09-24', name: '추석 연휴' },
    { date: '2026-09-25', name: '추석' },
    { date: '2026-09-26', name: '추석 연휴' },
    { date: '2026-10-03', name: '개천절' },
    { date: '2026-10-05', name: '대체공휴일' },
    { date: '2026-10-09', name: '한글날' },
    { date: '2026-12-25', name: '성탄절' },
  ],
} as const;

// ========================================
// Error Codes
// ========================================

export const ERROR_CODES = {
  // Common
  NOT_FOUND: '리소스를 찾을 수 없습니다.',
  VALIDATION_ERROR: '입력 데이터가 유효하지 않습니다.',
  INTERNAL_ERROR: '서버 오류가 발생했습니다.',

  // Student
  STUDENT_WITHDRAWN: '퇴원한 수강생입니다.',
  STUDENT_INACTIVE: '일시중단 상태의 수강생입니다.',
  ACTIVE_ENROLLMENT_EXISTS: '활성 수강 중인 반이 있습니다.',

  // Instructor
  ACTIVE_CLASS_EXISTS: '담당 중인 반이 있습니다.',

  // Class
  INSTRUCTOR_SCHEDULE_CONFLICT: '강사 시간표가 충돌합니다.',
  ROOM_SCHEDULE_CONFLICT: '교실 시간표가 충돌합니다.',
  SCHEDULE_CONFLICT: '시간표 충돌이 발생했습니다.',
  CLASS_CLOSED: '종료된 반입니다.',
  CLASS_FULL: '정원이 초과되었습니다.',
  CLASS_FULL_WAITLISTED: '정원 초과로 대기자 등록되었습니다.',
  CLASS_STILL_FULL: '아직 정원에 여유가 없습니다.',
  INVALID_MAX_STUDENTS: '정원은 1명 이상이어야 합니다.',
  INVALID_MONTHLY_FEE: '수강료는 0원 이상이어야 합니다.',

  // Enrollment
  DUPLICATE_ENROLLMENT: '이미 수강 등록되어 있습니다.',
  INACTIVE_ENROLLMENT: '활성 수강 상태가 아닙니다.',

  // Attendance
  DUPLICATE_ATTENDANCE: '이미 출석 체크되었습니다.',
  HOLIDAY_NOT_ALLOWED: '휴일에는 불가합니다.',

  // Payment
  DUPLICATE_PAYMENT: '이미 해당 월의 수납이 존재합니다.',
  INVALID_AMOUNT: '금액이 유효하지 않습니다.',
  INVALID_PARTIAL_AMOUNT: '부분 납부는 50%만 가능합니다.',
  INVALID_PAYMENT_STATUS: '납부되지 않은 건입니다.',

  // Refund
  REFUND_AMOUNT_EXCEEDS: '환불 금액이 납부 금액을 초과합니다.',

  // MakeupClass
  NO_ABSENCE_RECORD: '결석 기록이 없습니다.',
  INVALID_MAKEUP_TIME: '같은 반의 다른 시간대만 가능합니다.',

  // Waitlist
  DUPLICATE_WAITLIST: '이미 대기 등록되어 있습니다.',

  // Salary
  DUPLICATE_SALARY: '이미 해당 월의 급여가 등록되어 있습니다.',

  // Holiday
  DUPLICATE_HOLIDAY: '이미 등록된 휴일입니다.',
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;
