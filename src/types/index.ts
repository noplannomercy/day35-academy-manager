// ========================================
// Enum Types
// ========================================

export type StudentStatus = 'active' | 'inactive' | 'withdrawn';
export type InstructorStatus = 'active' | 'inactive';
export type ClassStatus = 'active' | 'closed';
export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'overdue';
export type PaymentMethod = 'cash' | 'card' | 'transfer';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type EnrollmentStatus = 'active' | 'dropped';
export type MakeupStatus = 'pending' | 'completed' | 'cancelled';
export type WaitlistStatus = 'waiting' | 'enrolled' | 'cancelled';
export type SalaryStatus = 'unpaid' | 'paid';
export type HolidayType = 'public' | 'manual';
export type ConsultationType = 'phone' | 'visit' | 'online';

// ========================================
// Master Data Types
// ========================================

export interface Level {
  id: string;
  name: string;
  order: number;
}

export interface Subject {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Source {
  id: string;
  name: string;
}

// ========================================
// Schedule Type
// ========================================

export interface Schedule {
  dayOfWeek: number; // 0 (일) ~ 6 (토)
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
}

// ========================================
// Core Entity Types
// ========================================

export interface Student {
  id: string;
  name: string;
  phone: string;
  parentPhone?: string;
  email?: string;
  birthDate?: string; // YYYY-MM-DD
  levelId?: string;
  sourceId?: string;
  status: StudentStatus;
  enrollDate: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;  // ISO string
}

export interface Instructor {
  id: string;
  name: string;
  phone: string;
  email?: string;
  subjectIds: string[]; // Multiple subjects allowed
  monthlySalary?: number;
  status: InstructorStatus;
  color?: string; // hex color for schedule display
  notes?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  subjectId: string;
  instructorId: string;
  maxStudents: number;
  schedule: Schedule[];
  monthlyFee: number;
  status: ClassStatus;
  roomId?: string;
  notes?: string;
  createdAt: string;
}

// ========================================
// Relation Entity Types
// ========================================

export interface Enrollment {
  id: string;
  studentId: string;
  classId: string;
  enrollDate: string; // YYYY-MM-DD
  status: EnrollmentStatus;
  droppedDate?: string; // YYYY-MM-DD
}

export interface Attendance {
  id: string;
  classId: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  classId: string;
  amount: number;
  paidAmount: number;
  month: string; // YYYY-MM
  status: PaymentStatus;
  paidDate?: string; // YYYY-MM-DD
  method?: PaymentMethod;
  isProrated: boolean;
  notes?: string;
  createdAt: string;
}

export interface Consultation {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  type: ConsultationType;
  content: string;
  nextAction?: string;
  nextActionDate?: string; // YYYY-MM-DD
  createdAt: string;
}

// ========================================
// Additional Entity Types
// ========================================

export interface MakeupClass {
  id: string;
  enrollmentId: string;
  absenceDate: string; // YYYY-MM-DD
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:MM
  status: MakeupStatus;
  createdAt: string;
}

export interface Waitlist {
  id: string;
  studentId: string;
  classId: string;
  registeredAt: string; // ISO string
  priority: number; // FIFO: lower number = higher priority
  status: WaitlistStatus;
  enrolledAt?: string; // ISO string
}

export interface InstructorSalary {
  id: string;
  instructorId: string;
  month: string; // YYYY-MM
  amount: number;
  status: SalaryStatus;
  paidDate?: string; // YYYY-MM-DD
  notes?: string;
  createdAt: string;
}

export interface Holiday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  type: HolidayType;
  createdAt: string;
}

export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  refundDate: string; // YYYY-MM-DD
  createdAt: string;
}

// ========================================
// Settings Type
// ========================================

export interface Settings {
  academyName: string;
  phone: string;
  address: string;
  operatingHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  levels: Level[];
  subjects: Subject[];
  rooms: Room[];
  sources: Source[];
}

// ========================================
// Database Interface
// ========================================

export interface Database {
  students: Student[];
  instructors: Instructor[];
  classes: Class[];
  enrollments: Enrollment[];
  attendances: Attendance[];
  payments: Payment[];
  consultations: Consultation[];
  makeupClasses: MakeupClass[];
  waitlists: Waitlist[];
  instructorSalaries: InstructorSalary[];
  holidays: Holiday[];
  refunds: Refund[];
  settings: Settings;
}

// ========================================
// API Response Types
// ========================================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ConflictResult {
  type: 'instructor' | 'room' | 'student';
  existingClass?: string;
  classId?: string;
  className?: string;
  dayOfWeek: number;
  time: string;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  code?: string;
  pagination?: Pagination;
  warning?: string;
  conflicts?: ConflictResult[];
}
