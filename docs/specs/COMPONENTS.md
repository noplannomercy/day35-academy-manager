# Academy Manager - Components Specification

> **Version**: 1.0 (SRS_FINAL 기반)
> **Last Updated**: 2026-02-02

---

## 1. Component Architecture Overview

```
components/
├── layout/                 # 레이아웃 컴포넌트
│   ├── AppLayout.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   └── GlobalSearch.tsx
├── common/                 # 공통 컴포넌트
│   ├── DataTable.tsx
│   ├── Pagination.tsx
│   ├── ConfirmDialog.tsx
│   ├── StatusBadge.tsx
│   ├── SearchInput.tsx
│   ├── DatePicker.tsx
│   ├── TimePicker.tsx
│   ├── SelectField.tsx
│   ├── FormField.tsx
│   ├── LoadingSpinner.tsx
│   ├── EmptyState.tsx
│   └── ErrorMessage.tsx
├── dashboard/              # 대시보드 컴포넌트
│   ├── StatCard.tsx
│   ├── UnpaidList.tsx
│   ├── TodaySchedule.tsx
│   ├── TodayReminders.tsx
│   ├── RecentConsultations.tsx
│   └── EnrollmentChart.tsx
├── student/                # 수강생 컴포넌트
│   ├── StudentList.tsx
│   ├── StudentForm.tsx
│   ├── StudentDetail.tsx
│   ├── StudentEnrollments.tsx
│   ├── StudentPayments.tsx
│   ├── StudentConsultations.tsx
│   └── StudentWaitlists.tsx
├── instructor/             # 강사 컴포넌트
│   ├── InstructorList.tsx
│   ├── InstructorForm.tsx
│   ├── InstructorCard.tsx
│   └── InstructorSelect.tsx
├── class/                  # 반 컴포넌트
│   ├── ClassList.tsx
│   ├── ClassForm.tsx
│   ├── ClassDetail.tsx
│   ├── ClassEnrollments.tsx
│   ├── ClassWaitlist.tsx
│   ├── ScheduleEditor.tsx
│   └── ClassSelect.tsx
├── enrollment/             # 수강등록 컴포넌트
│   ├── EnrollmentForm.tsx
│   ├── EnrollmentList.tsx
│   ├── ConflictWarning.tsx
│   └── DropConfirmDialog.tsx
├── attendance/             # 출석 컴포넌트
│   ├── AttendanceBoard.tsx
│   ├── AttendanceRow.tsx
│   ├── AttendanceStats.tsx
│   ├── DateSelector.tsx
│   └── HolidayBanner.tsx
├── makeup/                 # 보강 컴포넌트
│   ├── MakeupList.tsx
│   ├── MakeupForm.tsx
│   └── MakeupStatusBadge.tsx
├── payment/                # 수납 컴포넌트
│   ├── PaymentList.tsx
│   ├── PaymentForm.tsx
│   ├── PaymentDetail.tsx
│   ├── PayDialog.tsx
│   ├── ProratedCalculator.tsx
│   └── UnpaidSummary.tsx
├── refund/                 # 환불 컴포넌트
│   ├── RefundList.tsx
│   ├── RefundForm.tsx
│   └── RefundDialog.tsx
├── consultation/           # 상담 컴포넌트
│   ├── ConsultationList.tsx
│   ├── ConsultationForm.tsx
│   └── ConsultationCard.tsx
├── salary/                 # 급여 컴포넌트
│   ├── SalaryList.tsx
│   ├── SalaryForm.tsx
│   ├── SalaryPayDialog.tsx
│   └── SalarySummary.tsx
├── waitlist/               # 대기자 컴포넌트
│   ├── WaitlistTable.tsx
│   ├── WaitlistForm.tsx
│   └── EnrollDialog.tsx
├── schedule/               # 시간표 컴포넌트
│   ├── WeeklySchedule.tsx
│   ├── MonthlyCalendar.tsx
│   ├── ScheduleCell.tsx
│   └── ScheduleFilter.tsx
├── holiday/                # 휴일 컴포넌트
│   ├── HolidayList.tsx
│   ├── HolidayForm.tsx
│   └── PublicHolidayInit.tsx
├── settings/               # 설정 컴포넌트
│   ├── AcademyInfoForm.tsx
│   ├── LevelManager.tsx
│   ├── SubjectManager.tsx
│   ├── RoomManager.tsx
│   ├── SourceManager.tsx
│   ├── BackupSection.tsx
│   └── MasterDataList.tsx
└── export/                 # 내보내기 컴포넌트
    ├── ExportButton.tsx
    └── ExportDialog.tsx
```

---

## 2. Layout Components

### 2.1 AppLayout
전체 애플리케이션 레이아웃

```typescript
interface AppLayoutProps {
  children: React.ReactNode;
}

// 구성
// - Sidebar (좌측 네비게이션)
// - Header (상단 헤더 + 통합검색)
// - Main Content Area
```

### 2.2 Sidebar
좌측 네비게이션 메뉴

```typescript
interface SidebarProps {
  currentPath: string;
}

// 메뉴 항목
const menuItems = [
  { path: '/', label: '대시보드', icon: LayoutDashboard },
  { path: '/students', label: '수강생', icon: Users },
  { path: '/instructors', label: '강사', icon: GraduationCap },
  { path: '/classes', label: '반 관리', icon: BookOpen },
  { path: '/attendance', label: '출석', icon: ClipboardCheck },
  { path: '/payments', label: '수납', icon: CreditCard },
  { path: '/salaries', label: '급여', icon: Wallet },
  { path: '/schedule', label: '시간표', icon: Calendar },
  { path: '/holidays', label: '휴일', icon: CalendarOff },
  { path: '/settings', label: '설정', icon: Settings },
];
```

### 2.3 Header
상단 헤더 (통합검색 포함)

```typescript
interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

// 포함 요소
// - 페이지 타이틀
// - GlobalSearch 컴포넌트
// - 액션 버튼 영역
```

### 2.4 GlobalSearch
통합 검색 컴포넌트

```typescript
interface GlobalSearchProps {
  onResultSelect?: (result: SearchResult) => void;
}

interface SearchResult {
  type: 'student' | 'class' | 'instructor';
  id: string;
  label: string;
  sublabel?: string;
}

// 기능
// - 실시간 검색 (debounce 300ms)
// - 수강생/반/강사 통합 검색
// - 결과 클릭 시 해당 페이지로 이동
// - 키보드 네비게이션 지원
```

---

## 3. Common Components

### 3.1 DataTable
공통 데이터 테이블

```typescript
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  width?: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
}
```

### 3.2 Pagination
페이지네이션 컴포넌트

```typescript
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}
```

### 3.3 ConfirmDialog
확인 다이얼로그

```typescript
interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
  onConfirm: () => void;
  loading?: boolean;
}
```

### 3.4 StatusBadge
상태 뱃지

```typescript
interface StatusBadgeProps {
  status: string;
  type: 'student' | 'payment' | 'attendance' | 'enrollment' |
        'makeup' | 'waitlist' | 'salary' | 'holiday';
}

// 상태별 색상 매핑
const statusColors = {
  student: {
    active: 'green',
    inactive: 'yellow',
    withdrawn: 'gray',
  },
  payment: {
    paid: 'green',
    partial: 'blue',
    unpaid: 'yellow',
    overdue: 'red',
  },
  // ...
};
```

### 3.5 SearchInput
검색 입력 필드

```typescript
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}
```

### 3.6 DatePicker
날짜 선택기

```typescript
interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];  // 휴일 등 비활성화 날짜
}
```

### 3.7 TimePicker
시간 선택기

```typescript
interface TimePickerProps {
  value?: string;  // HH:MM
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minTime?: string;
  maxTime?: string;
  step?: number;  // 분 단위 (기본: 30)
}
```

### 3.8 SelectField
선택 필드 (마스터 데이터용)

```typescript
interface SelectFieldProps {
  value?: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;  // 다중 선택 (강사 과목 등)
}
```

### 3.9 FormField
폼 필드 래퍼

```typescript
interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  description?: string;
  children: React.ReactNode;
}
```

### 3.10 LoadingSpinner
로딩 스피너

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}
```

### 3.11 EmptyState
빈 상태 표시

```typescript
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

### 3.12 ErrorMessage
에러 메시지 표시

```typescript
interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}
```

---

## 4. Dashboard Components

### 4.1 StatCard
통계 카드

```typescript
interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

// 사용 예
// - 전체 수강생 수
// - 운영 중인 반 수
// - 활동 강사 수
// - 이번 달 수납액
// - 미납 건수/금액
// - 평균 출석률
```

### 4.2 UnpaidList
미납자 목록

```typescript
interface UnpaidListProps {
  data: {
    student: Student;
    class: Class;
    amount: number;
    month: string;
  }[];
  limit?: number;
  onViewAll?: () => void;
}
```

### 4.3 TodaySchedule
오늘 수업 목록

```typescript
interface TodayScheduleProps {
  data: {
    class: Class;
    instructor: Instructor;
    startTime: string;
    endTime: string;
  }[];
}
```

### 4.4 TodayReminders
오늘 후속 조치 목록 (상담 리마인더)

```typescript
interface TodayRemindersProps {
  data: {
    consultation: Consultation;
    student: Student;
  }[];
}
```

### 4.5 RecentConsultations
최근 상담 목록

```typescript
interface RecentConsultationsProps {
  data: {
    consultation: Consultation;
    student: Student;
  }[];
  limit?: number;
}
```

### 4.6 EnrollmentChart
수강 등록 추이 차트

```typescript
interface EnrollmentChartProps {
  data: {
    month: string;
    count: number;
  }[];
}

// Recharts BarChart 사용
```

---

## 5. Student Components

### 5.1 StudentList
수강생 목록

```typescript
interface StudentListProps {
  initialData?: {
    students: Student[];
    pagination: Pagination;
  };
}

// 기능
// - 이름/연락처 검색
// - 상태 필터 (active/inactive/withdrawn)
// - 등급 필터
// - 페이지네이션
// - 행 클릭 → 상세 페이지
```

### 5.2 StudentForm
수강생 등록/수정 폼

```typescript
interface StudentFormProps {
  student?: Student;  // 수정 시
  onSubmit: (data: StudentFormData) => Promise<void>;
  onCancel: () => void;
}

interface StudentFormData {
  name: string;
  phone: string;
  parentPhone?: string;
  email?: string;
  birthDate?: string;
  levelId?: string;
  sourceId?: string;
  notes?: string;
}

// 필드
// - 이름 (필수)
// - 연락처 (필수)
// - 학부모 연락처
// - 이메일
// - 생년월일 (DatePicker)
// - 등급 (SelectField - Settings.levels)
// - 등록 경로 (SelectField - Settings.sources)
// - 비고
```

### 5.3 StudentDetail
수강생 상세 정보

```typescript
interface StudentDetailProps {
  studentId: string;
}

// 탭 구성
// - 기본 정보
// - 수강 현황 (StudentEnrollments)
// - 수납 내역 (StudentPayments)
// - 상담 기록 (StudentConsultations)
// - 대기 현황 (StudentWaitlists)
```

### 5.4 StudentEnrollments
수강생의 수강 현황

```typescript
interface StudentEnrollmentsProps {
  studentId: string;
  enrollments: {
    enrollment: Enrollment;
    class: Class;
    attendanceRate: number;
  }[];
  onEnroll: () => void;
  onDrop: (enrollmentId: string) => void;
}
```

### 5.5 StudentPayments
수강생의 수납 내역

```typescript
interface StudentPaymentsProps {
  studentId: string;
  payments: Payment[];
  onAddPayment: () => void;
}
```

### 5.6 StudentConsultations
수강생의 상담 기록

```typescript
interface StudentConsultationsProps {
  studentId: string;
  consultations: Consultation[];
  onAdd: () => void;
  onDelete: (id: string) => void;
}
```

### 5.7 StudentWaitlists
수강생의 대기 현황

```typescript
interface StudentWaitlistsProps {
  studentId: string;
  waitlists: {
    waitlist: Waitlist;
    class: Class;
  }[];
  onCancel: (id: string) => void;
}
```

---

## 6. Instructor Components

### 6.1 InstructorList
강사 목록

```typescript
interface InstructorListProps {
  initialData?: Instructor[];
}

// 기능
// - 상태 필터
// - 과목 필터
// - 담당 반 수/수강생 수 표시
```

### 6.2 InstructorForm
강사 등록/수정 폼

```typescript
interface InstructorFormProps {
  instructor?: Instructor;
  onSubmit: (data: InstructorFormData) => Promise<void>;
  onCancel: () => void;
}

interface InstructorFormData {
  name: string;
  phone: string;
  email?: string;
  subjectIds: string[];  // 다중 선택
  monthlySalary?: number;
  color?: string;
  notes?: string;
}
```

### 6.3 InstructorCard
강사 카드 (목록에서 사용)

```typescript
interface InstructorCardProps {
  instructor: Instructor;
  classCount: number;
  studentCount: number;
  onClick?: () => void;
}
```

### 6.4 InstructorSelect
강사 선택 드롭다운

```typescript
interface InstructorSelectProps {
  value?: string;
  onChange: (instructorId: string) => void;
  subjectId?: string;  // 해당 과목 담당 강사만 필터
  disabled?: boolean;
}
```

---

## 7. Class Components

### 7.1 ClassList
반 목록

```typescript
interface ClassListProps {
  initialData?: {
    classes: ClassWithDetails[];
    pagination: Pagination;
  };
}

interface ClassWithDetails {
  class: Class;
  instructor: Instructor;
  subject: Subject;
  room?: Room;
  currentStudents: number;
  waitlistCount: number;
}
```

### 7.2 ClassForm
반 생성/수정 폼

```typescript
interface ClassFormProps {
  classData?: Class;
  onSubmit: (data: ClassFormData) => Promise<void>;
  onCancel: () => void;
}

interface ClassFormData {
  name: string;
  subjectId: string;
  instructorId: string;
  maxStudents: number;
  schedule: Schedule[];
  monthlyFee: number;
  roomId?: string;
  notes?: string;
}

// 특수 기능
// - ScheduleEditor로 시간표 편집
// - 시간표 충돌 실시간 검증
```

### 7.3 ClassDetail
반 상세 정보

```typescript
interface ClassDetailProps {
  classId: string;
}

// 포함 섹션
// - 기본 정보
// - 수강생 목록 (ClassEnrollments)
// - 대기자 목록 (ClassWaitlist)
// - 최근 출석 현황
```

### 7.4 ClassEnrollments
반의 수강생 목록

```typescript
interface ClassEnrollmentsProps {
  classId: string;
  enrollments: {
    enrollment: Enrollment;
    student: Student;
    attendanceRate: number;
    paymentStatus: PaymentStatus;
  }[];
  maxStudents: number;
  onEnroll: () => void;
  onDrop: (enrollmentId: string) => void;
}
```

### 7.5 ClassWaitlist
반의 대기자 목록

```typescript
interface ClassWaitlistProps {
  classId: string;
  waitlists: {
    waitlist: Waitlist;
    student: Student;
  }[];
  hasVacancy: boolean;
  onEnroll: (waitlistId: string) => void;
  onCancel: (waitlistId: string) => void;
}
```

### 7.6 ScheduleEditor
수업 시간표 편집기

```typescript
interface ScheduleEditorProps {
  value: Schedule[];
  onChange: (schedules: Schedule[]) => void;
  conflicts?: ConflictResult[];
}

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// 기능
// - 요일별 시간 추가/삭제
// - 충돌 시 경고 표시
// - 시각적 시간표 미리보기
```

### 7.7 ClassSelect
반 선택 드롭다운

```typescript
interface ClassSelectProps {
  value?: string;
  onChange: (classId: string) => void;
  studentId?: string;  // 해당 학생이 등록 가능한 반만
  subjectId?: string;  // 해당 과목 반만
  disabled?: boolean;
}
```

---

## 8. Enrollment Components

### 8.1 EnrollmentForm
수강 등록 폼 (다이얼로그)

```typescript
interface EnrollmentFormProps {
  studentId?: string;  // 수강생 페이지에서 호출 시
  classId?: string;    // 반 페이지에서 호출 시
  onSubmit: (data: EnrollmentFormData) => Promise<void>;
  onCancel: () => void;
}

interface EnrollmentFormData {
  studentId: string;
  classId: string;
}
```

### 8.2 EnrollmentList
수강 현황 목록

```typescript
interface EnrollmentListProps {
  filters?: {
    classId?: string;
    studentId?: string;
    status?: EnrollmentStatus;
  };
}
```

### 8.3 ConflictWarning
시간표 충돌 경고

```typescript
interface ConflictWarningProps {
  conflicts: {
    classId: string;
    className: string;
    dayOfWeek: number;
    time: string;
  }[];
  onProceed?: () => void;
  onCancel?: () => void;
}
```

### 8.4 DropConfirmDialog
수강 취소 확인

```typescript
interface DropConfirmDialogProps {
  enrollment: Enrollment;
  student: Student;
  class: Class;
  onConfirm: () => void;
  onCancel: () => void;
}
```

---

## 9. Attendance Components

### 9.1 AttendanceBoard
출석 체크 보드

```typescript
interface AttendanceBoardProps {
  classId: string;
  date: string;
}

// 기능
// - 반 선택
// - 날짜 선택 (휴일 비활성화)
// - 수강생별 출석 상태 체크
// - 일괄 저장
```

### 9.2 AttendanceRow
출석 체크 행

```typescript
interface AttendanceRowProps {
  student: Student;
  attendance?: Attendance;
  onChange: (status: AttendanceStatus, notes?: string) => void;
  disabled?: boolean;
}
```

### 9.3 AttendanceStats
출석 통계

```typescript
interface AttendanceStatsProps {
  classId?: string;
  studentId?: string;
  startDate?: string;
  endDate?: string;
}

// 표시 항목
// - 총 수업일
// - 출석/결석/지각/사유결석 수
// - 출석률
```

### 9.4 DateSelector
날짜 선택기 (출석용)

```typescript
interface DateSelectorProps {
  value: string;
  onChange: (date: string) => void;
  holidays: Holiday[];
  classSchedule: Schedule[];  // 수업 없는 요일 비활성화
}
```

### 9.5 HolidayBanner
휴일 배너

```typescript
interface HolidayBannerProps {
  holiday: Holiday;
}

// 휴일 선택 시 "휴일입니다. 출석 체크가 불가합니다." 표시
```

---

## 10. MakeupClass Components

### 10.1 MakeupList
보강 목록

```typescript
interface MakeupListProps {
  filters?: {
    classId?: string;
    studentId?: string;
    status?: MakeupStatus;
  };
}
```

### 10.2 MakeupForm
보강 예약 폼

```typescript
interface MakeupFormProps {
  enrollmentId: string;
  absenceDates: string[];  // 선택 가능한 결석일
  onSubmit: (data: MakeupFormData) => Promise<void>;
  onCancel: () => void;
}

interface MakeupFormData {
  enrollmentId: string;
  absenceDate: string;
  scheduledDate: string;
  scheduledTime: string;
}
```

### 10.3 MakeupStatusBadge
보강 상태 뱃지

```typescript
interface MakeupStatusBadgeProps {
  status: MakeupStatus;
}
```

---

## 11. Payment Components

### 11.1 PaymentList
수납 목록

```typescript
interface PaymentListProps {
  filters?: {
    month?: string;
    status?: PaymentStatus;
    studentId?: string;
    classId?: string;
  };
}

// 기능
// - 월별 필터
// - 상태 필터
// - 수납 합계 표시
// - 행 클릭 → 상세
```

### 11.2 PaymentForm
수납 등록 폼

```typescript
interface PaymentFormProps {
  studentId?: string;
  classId?: string;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onCancel: () => void;
}

interface PaymentFormData {
  studentId: string;
  classId: string;
  amount: number;
  month: string;
  isProrated?: boolean;
  notes?: string;
}

// 특수 기능
// - 일할 계산 체크 시 ProratedCalculator 표시
```

### 11.3 PaymentDetail
수납 상세

```typescript
interface PaymentDetailProps {
  paymentId: string;
}

// 포함 정보
// - 수납 정보
// - 수강생/반 정보
// - 환불 내역
// - 납부/환불 버튼
```

### 11.4 PayDialog
납부 처리 다이얼로그

```typescript
interface PayDialogProps {
  payment: Payment;
  onConfirm: (type: 'full' | 'half', method: PaymentMethod) => Promise<void>;
  onCancel: () => void;
}

// 옵션
// - 전액 납부
// - 반액 납부 (partial 상태인 경우만)
// - 납부 방법 선택
```

### 11.5 ProratedCalculator
일할 계산기

```typescript
interface ProratedCalculatorProps {
  classId: string;
  enrollDate: string;
  month: string;
  onCalculate: (result: ProratedResult) => void;
}

interface ProratedResult {
  originalAmount: number;
  proratedAmount: number;
  totalClassDays: number;
  remainingDays: number;
}
```

### 11.6 UnpaidSummary
미납 요약

```typescript
interface UnpaidSummaryProps {
  unpaidCount: number;
  unpaidAmount: number;
  overdueCount: number;
  overdueAmount: number;
}
```

---

## 12. Refund Components

### 12.1 RefundList
환불 목록

```typescript
interface RefundListProps {
  filters?: {
    studentId?: string;
    startDate?: string;
    endDate?: string;
  };
}
```

### 12.2 RefundForm
환불 처리 폼

```typescript
interface RefundFormProps {
  payment: Payment;
  onSubmit: (data: RefundFormData) => Promise<void>;
  onCancel: () => void;
}

interface RefundFormData {
  paymentId: string;
  amount: number;
  reason: string;
}

// 제약
// - 환불액 ≤ 납부액
// - 사유 필수
```

### 12.3 RefundDialog
환불 처리 다이얼로그 (PaymentDetail에서 사용)

```typescript
interface RefundDialogProps {
  payment: Payment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, reason: string) => Promise<void>;
}
```

---

## 13. Consultation Components

### 13.1 ConsultationList
상담 기록 목록

```typescript
interface ConsultationListProps {
  studentId?: string;
  filters?: {
    type?: ConsultationType;
    hasNextAction?: boolean;
    startDate?: string;
    endDate?: string;
  };
}
```

### 13.2 ConsultationForm
상담 기록 등록 폼

```typescript
interface ConsultationFormProps {
  studentId: string;
  onSubmit: (data: ConsultationFormData) => Promise<void>;
  onCancel: () => void;
}

interface ConsultationFormData {
  studentId: string;
  date: string;
  type: ConsultationType;
  content: string;
  nextAction?: string;
  nextActionDate?: string;
}
```

### 13.3 ConsultationCard
상담 기록 카드

```typescript
interface ConsultationCardProps {
  consultation: Consultation;
  onDelete?: () => void;
}

// 표시 항목
// - 상담 유형 아이콘
// - 상담일
// - 상담 내용 (접기/펼치기)
// - 후속 조치 (있는 경우)
// - 삭제 버튼
```

---

## 14. Salary Components

### 14.1 SalaryList
급여 목록

```typescript
interface SalaryListProps {
  filters?: {
    instructorId?: string;
    month?: string;
    status?: SalaryStatus;
  };
}

// 기능
// - 월별 필터
// - 강사별 필터
// - 상태 필터
// - 급여 합계 표시
```

### 14.2 SalaryForm
급여 등록 폼

```typescript
interface SalaryFormProps {
  instructorId?: string;
  onSubmit: (data: SalaryFormData) => Promise<void>;
  onCancel: () => void;
}

interface SalaryFormData {
  instructorId: string;
  month: string;
  amount: number;
  notes?: string;
}

// 기능
// - 강사 선택 시 기본 급여 자동 입력
```

### 14.3 SalaryPayDialog
급여 지급 다이얼로그

```typescript
interface SalaryPayDialogProps {
  salary: InstructorSalary;
  instructor: Instructor;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

### 14.4 SalarySummary
급여 요약

```typescript
interface SalarySummaryProps {
  month: string;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  instructorCount: number;
}
```

---

## 15. Waitlist Components

### 15.1 WaitlistTable
대기자 테이블

```typescript
interface WaitlistTableProps {
  classId?: string;
  data: {
    waitlist: Waitlist;
    student: Student;
    class: Class;
  }[];
  showClassColumn?: boolean;
  onEnroll?: (id: string) => void;
  onCancel?: (id: string) => void;
}
```

### 15.2 WaitlistForm
대기 등록 폼

```typescript
interface WaitlistFormProps {
  studentId?: string;
  classId?: string;
  onSubmit: (data: WaitlistFormData) => Promise<void>;
  onCancel: () => void;
}

interface WaitlistFormData {
  studentId: string;
  classId: string;
}
```

### 15.3 EnrollDialog
대기자 수강 전환 다이얼로그

```typescript
interface EnrollDialogProps {
  waitlist: Waitlist;
  student: Student;
  class: Class;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
```

---

## 16. Schedule Components

### 16.1 WeeklySchedule
주간 시간표

```typescript
interface WeeklyScheduleProps {
  date?: string;
  instructorId?: string;
  roomId?: string;
}

// 기능
// - 주간 캘린더 뷰
// - 강사/교실 필터
// - 수업 클릭 → 반 상세
// - 주 이동 네비게이션
```

### 16.2 MonthlyCalendar
월간 달력

```typescript
interface MonthlyCalendarProps {
  year: number;
  month: number;
  instructorId?: string;
  roomId?: string;
}

// 기능
// - 월간 캘린더 뷰
// - 휴일 표시
// - 날짜별 수업 수 표시
// - 날짜 클릭 → 해당 날짜 수업 목록
```

### 16.3 ScheduleCell
시간표 셀

```typescript
interface ScheduleCellProps {
  class: Class;
  instructor: Instructor;
  room?: Room;
  startTime: string;
  endTime: string;
  onClick?: () => void;
}

// 표시 항목
// - 반 이름
// - 강사명
// - 시간
// - 강사 색상 배경
```

### 16.4 ScheduleFilter
시간표 필터

```typescript
interface ScheduleFilterProps {
  instructorId?: string;
  roomId?: string;
  onInstructorChange: (id?: string) => void;
  onRoomChange: (id?: string) => void;
}
```

---

## 17. Holiday Components

### 17.1 HolidayList
휴일 목록

```typescript
interface HolidayListProps {
  year: number;
  onYearChange: (year: number) => void;
}

// 기능
// - 연도 선택
// - 공휴일/수동 구분 표시
// - 삭제 기능
```

### 17.2 HolidayForm
휴일 등록 폼

```typescript
interface HolidayFormProps {
  onSubmit: (data: HolidayFormData) => Promise<void>;
  onCancel: () => void;
}

interface HolidayFormData {
  date: string;
  name: string;
  type: HolidayType;
}
```

### 17.3 PublicHolidayInit
공휴일 자동 등록

```typescript
interface PublicHolidayInitProps {
  year: number;
  existingHolidays: Holiday[];
  onInit: (year: number) => Promise<void>;
}

// 기능
// - 해당 연도 공휴일 자동 등록 버튼
// - 이미 등록된 경우 비활성화
```

---

## 18. Settings Components

### 18.1 AcademyInfoForm
학원 기본 정보 폼

```typescript
interface AcademyInfoFormProps {
  settings: Settings;
  onSubmit: (data: Partial<Settings>) => Promise<void>;
}

// 필드
// - 학원명
// - 연락처
// - 주소
// - 운영시간 (시작/종료)
```

### 18.2 LevelManager
등급 관리

```typescript
interface LevelManagerProps {
  levels: Level[];
  onUpdate: (levels: Level[]) => Promise<void>;
}

// 기능
// - 등급 추가/수정/삭제
// - 순서 변경 (드래그)
```

### 18.3 SubjectManager
과목 관리

```typescript
interface SubjectManagerProps {
  subjects: Subject[];
  onUpdate: (subjects: Subject[]) => Promise<void>;
}

// 기능
// - 과목 추가/수정/삭제
```

### 18.4 RoomManager
교실 관리

```typescript
interface RoomManagerProps {
  rooms: Room[];
  onUpdate: (rooms: Room[]) => Promise<void>;
}

// 기능
// - 교실 추가/수정/삭제
// - 수용 인원 설정
```

### 18.5 SourceManager
등록 경로 관리

```typescript
interface SourceManagerProps {
  sources: Source[];
  onUpdate: (sources: Source[]) => Promise<void>;
}

// 기능
// - 등록 경로 추가/수정/삭제
```

### 18.6 BackupSection
백업/복원 섹션

```typescript
interface BackupSectionProps {
  onBackup: () => Promise<void>;
  onRestore: (file: File) => Promise<void>;
}

// 기능
// - 백업 다운로드 버튼
// - 복원 파일 업로드
// - 복원 확인 다이얼로그
```

### 18.7 MasterDataList
마스터 데이터 목록 (공통)

```typescript
interface MasterDataListProps<T> {
  items: T[];
  columns: ColumnDef<T>[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
  emptyMessage: string;
}
```

---

## 19. Export Components

### 19.1 ExportButton
내보내기 버튼

```typescript
interface ExportButtonProps {
  type: 'students' | 'payments' | 'attendance';
  filters?: Record<string, any>;
  label?: string;
}
```

### 19.2 ExportDialog
내보내기 옵션 다이얼로그

```typescript
interface ExportDialogProps {
  type: 'students' | 'payments' | 'attendance';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (filters: ExportFilters) => Promise<void>;
}

interface ExportFilters {
  // type별로 다른 필터
  students: { status?: StudentStatus; levelId?: string };
  payments: { month?: string; status?: PaymentStatus };
  attendance: { classId?: string; startDate?: string; endDate?: string };
}
```

---

## 20. Page Routing Structure

```typescript
// app/(routes)/layout.tsx
// - AppLayout 적용

// Pages
const pages = {
  // Dashboard
  '/': 'DashboardPage',

  // Students
  '/students': 'StudentListPage',
  '/students/new': 'StudentNewPage',
  '/students/[id]': 'StudentDetailPage',
  '/students/[id]/edit': 'StudentEditPage',

  // Instructors
  '/instructors': 'InstructorListPage',
  '/instructors/new': 'InstructorNewPage',
  '/instructors/[id]/edit': 'InstructorEditPage',

  // Classes
  '/classes': 'ClassListPage',
  '/classes/new': 'ClassNewPage',
  '/classes/[id]': 'ClassDetailPage',
  '/classes/[id]/edit': 'ClassEditPage',

  // Attendance
  '/attendance': 'AttendancePage',

  // Payments
  '/payments': 'PaymentListPage',
  '/payments/[id]': 'PaymentDetailPage',

  // Salaries
  '/salaries': 'SalaryListPage',

  // Schedule
  '/schedule': 'SchedulePage',

  // Holidays
  '/holidays': 'HolidayPage',

  // Settings
  '/settings': 'SettingsPage',
};
```

---

## 21. State Management

### 21.1 Server State (React Query / SWR 패턴)
```typescript
// API 호출 및 캐싱은 fetch + SWR 패턴 사용
// 또는 단순 useState + useEffect

// 예시: 수강생 목록
function useStudents(filters: StudentFilters) {
  const [data, setData] = useState<StudentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents(filters)
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [filters]);

  return { data, loading, error, refetch: () => { /* ... */ } };
}
```

### 21.2 UI State (Local State)
```typescript
// 각 컴포넌트의 UI 상태는 useState로 관리
// - 모달 열림/닫힘
// - 폼 입력값
// - 선택된 항목
// - 필터/정렬 상태
```

### 21.3 Form State (React Hook Form)
```typescript
// 폼 상태는 React Hook Form + Zod 사용
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(1, '이름을 입력하세요'),
  phone: z.string().min(1, '연락처를 입력하세요'),
  // ...
});

function StudentForm() {
  const form = useForm({
    resolver: zodResolver(studentSchema),
    defaultValues: { name: '', phone: '' },
  });
  // ...
}
```

---

## 22. Cross-Check: SRS Coverage

| SRS Section | Components Covered |
|-------------|-------------------|
| Student Entity | StudentList, StudentForm, StudentDetail, StudentEnrollments, StudentPayments, StudentConsultations, StudentWaitlists |
| Instructor Entity | InstructorList, InstructorForm, InstructorCard, InstructorSelect |
| Class Entity | ClassList, ClassForm, ClassDetail, ClassEnrollments, ClassWaitlist, ScheduleEditor, ClassSelect |
| Enrollment Entity | EnrollmentForm, EnrollmentList, ConflictWarning, DropConfirmDialog |
| Attendance Entity | AttendanceBoard, AttendanceRow, AttendanceStats, DateSelector, HolidayBanner |
| Payment Entity | PaymentList, PaymentForm, PaymentDetail, PayDialog, ProratedCalculator, UnpaidSummary |
| Consultation Entity | ConsultationList, ConsultationForm, ConsultationCard |
| MakeupClass Entity | MakeupList, MakeupForm, MakeupStatusBadge |
| Waitlist Entity | WaitlistTable, WaitlistForm, EnrollDialog |
| InstructorSalary Entity | SalaryList, SalaryForm, SalaryPayDialog, SalarySummary |
| Holiday Entity | HolidayList, HolidayForm, PublicHolidayInit |
| Refund Entity | RefundList, RefundForm, RefundDialog |
| Settings | AcademyInfoForm, LevelManager, SubjectManager, RoomManager, SourceManager, BackupSection |
| Dashboard | StatCard, UnpaidList, TodaySchedule, TodayReminders, RecentConsultations, EnrollmentChart |
| Schedule | WeeklySchedule, MonthlyCalendar, ScheduleCell, ScheduleFilter |
| Search | GlobalSearch |
| Export | ExportButton, ExportDialog |
| Common | DataTable, Pagination, ConfirmDialog, StatusBadge, SearchInput, DatePicker, TimePicker, SelectField, FormField, LoadingSpinner, EmptyState, ErrorMessage |
| Layout | AppLayout, Sidebar, Header |

**All SRS entities, features, and pages are covered.**
