# Day 35: 학원 관리 시스템 - SRS (Software Requirements Specification)

> **문서 버전**: FINAL (인터뷰 반영)
> **최종 수정**: 2026-02-02

## 1. 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 학원 관리 시스템 (Academy Manager) |
| 목적 | 소규모 학원의 수강생·강사·수업·수납·출석을 통합 관리 |
| 범위 | 풀스택 (Backend First: API Routes → Frontend) |
| 저장소 | data/db.json (JSON 파일 저장소) |
| AI 기능 | 없음 (순수 CRUD + 비즈니스 로직) |

---

## 2. 대상 사용자

- 소규모 학원 원장 / 관리자 (1인 사용)
- 인증 없음 (싱글 유저)

---

## 3. 엔티티 정의 (13개) [수정됨: 기존 8개 → 13개]

### 3.1 Student (수강생) [수정됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| name | string | ✅ | 이름 |
| phone | string | ✅ | 연락처 |
| parentPhone | string | | 학부모 연락처 |
| email | string | | 이메일 |
| birthDate | string | | 생년월일 (YYYY-MM-DD) |
| levelId | string | | 등급 ID (Settings에서 정의) [추가됨] |
| sourceId | string | | 등록 경로 ID (Settings에서 정의) [추가됨] |
| status | StudentStatus | 자동 | active / inactive / withdrawn |
| enrollDate | string | 자동 | 등록일 |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.2 Instructor (강사) [수정됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| name | string | ✅ | 이름 |
| phone | string | ✅ | 연락처 |
| email | string | | 이메일 |
| subjectIds | string[] | ✅ | 담당 과목 ID 배열 [수정됨: string → string[]] |
| monthlySalary | number | | 월 고정 급여 [추가됨] |
| status | InstructorStatus | 자동 | active / inactive |
| color | string | | 시간표 표시 색상 (hex) |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.3 Class (반/수업) [수정됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| name | string | ✅ | 반 이름 (예: 중등수학A반) |
| subjectId | string | ✅ | 과목 ID [수정됨: string → subjectId] |
| instructorId | string | ✅ | 담당 강사 |
| maxStudents | number | ✅ | 정원 |
| schedule | Schedule[] | ✅ | 수업 일정 (요일+시간) |
| monthlyFee | number | ✅ | 월 수강료 |
| status | ClassStatus | 자동 | active / closed |
| roomId | string | | 교실 ID [수정됨: string → roomId] |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.4 Schedule (수업 일정 - Class 내 배열)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| dayOfWeek | number | ✅ | 요일 (0=일 ~ 6=토) |
| startTime | string | ✅ | 시작 시간 (HH:MM) |
| endTime | string | ✅ | 종료 시간 (HH:MM) |

### 3.5 Enrollment (수강 등록 - 수강생↔반 연결)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| studentId | string | ✅ | 수강생 |
| classId | string | ✅ | 반 |
| enrollDate | string | 자동 | 등록일 |
| status | EnrollmentStatus | 자동 | active / dropped |
| droppedDate | string | | 수강 취소일 |

### 3.6 Attendance (출석)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| classId | string | ✅ | 반 |
| studentId | string | ✅ | 수강생 |
| date | string | ✅ | 날짜 (YYYY-MM-DD) |
| status | AttendanceStatus | ✅ | present / absent / late / excused |
| notes | string | | 사유 |

### 3.7 Payment (수납) [수정됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| studentId | string | ✅ | 수강생 |
| classId | string | ✅ | 반 |
| amount | number | ✅ | 금액 |
| paidAmount | number | | 실제 납부 금액 [추가됨] |
| month | string | ✅ | 해당 월 (YYYY-MM) |
| status | PaymentStatus | 자동 | paid / partial / unpaid / overdue [수정됨: partial 추가] |
| paidDate | string | | 납부일 |
| method | PaymentMethod | | 납부 방법 [수정됨: enum 타입으로 변경] |
| isProrated | boolean | | 일할 계산 여부 [추가됨] |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.8 Consultation (상담 기록) [수정됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| studentId | string | ✅ | 수강생 |
| date | string | ✅ | 상담일 (YYYY-MM-DD) |
| type | ConsultationType | ✅ | phone / visit / online |
| content | string | ✅ | 상담 내용 |
| nextAction | string | | 후속 조치 |
| nextActionDate | string | | 후속 조치 예정일 (YYYY-MM-DD) [추가됨] |
| createdAt | string | 자동 | |

### 3.9 MakeupClass (보강) [추가됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| enrollmentId | string | ✅ | 수강 등록 ID |
| absenceDate | string | ✅ | 원래 결석일 (YYYY-MM-DD) |
| scheduledDate | string | ✅ | 보강 예정일 (YYYY-MM-DD) |
| scheduledTime | string | ✅ | 보강 시간 (HH:MM) |
| status | MakeupStatus | 자동 | pending / completed / cancelled |
| createdAt | string | 자동 | |

### 3.10 Waitlist (대기자) [추가됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| studentId | string | ✅ | 수강생 ID |
| classId | string | ✅ | 반 ID |
| registeredAt | string | 자동 | 대기 등록일시 |
| priority | number | 자동 | 우선순위 (FIFO, 자동 증가) |
| status | WaitlistStatus | 자동 | waiting / enrolled / cancelled |
| enrolledAt | string | | 수강 전환일 |

### 3.11 InstructorSalary (강사 급여) [추가됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| instructorId | string | ✅ | 강사 ID |
| month | string | ✅ | 해당 월 (YYYY-MM) |
| amount | number | ✅ | 급여 금액 |
| status | SalaryStatus | 자동 | unpaid / paid |
| paidDate | string | | 지급일 |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.12 Holiday (휴일) [추가됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| date | string | ✅ | 날짜 (YYYY-MM-DD) |
| name | string | ✅ | 휴일명 |
| type | HolidayType | ✅ | public (공휴일) / manual (수동) |
| createdAt | string | 자동 | |

### 3.13 Refund (환불) [추가됨]
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| paymentId | string | ✅ | 원 수납 ID |
| amount | number | ✅ | 환불 금액 |
| reason | string | ✅ | 환불 사유 |
| refundDate | string | 자동 | 환불일 |
| createdAt | string | 자동 | |

---

## 4. 설정 (Settings) [수정됨: 대폭 확장]

### 4.1 Settings 구조
```typescript
interface Settings {
  // 기본 정보
  academyName: string;        // 학원명
  phone: string;              // 연락처
  address: string;            // 주소

  // 운영 설정
  operatingHours: {
    start: string;            // 운영 시작 시간 (HH:MM)
    end: string;              // 운영 종료 시간 (HH:MM)
  };

  // 마스터 데이터 [추가됨]
  levels: Level[];            // 등급 목록
  subjects: Subject[];        // 과목 목록
  rooms: Room[];              // 교실 목록
  sources: Source[];          // 등록 경로 목록
}

interface Level {
  id: string;
  name: string;               // 예: 초급, 중급, 고급
  order: number;              // 정렬 순서
}

interface Subject {
  id: string;
  name: string;               // 예: 수학, 영어, 국어
}

interface Room {
  id: string;
  name: string;               // 예: 101호, 대강의실
  capacity?: number;          // 수용 인원 (선택)
}

interface Source {
  id: string;
  name: string;               // 예: 지인소개, 온라인광고, 전화문의
}
```

---

## 5. Enum 타입 정의 [추가됨]

```typescript
// 기존 상태 타입
type StudentStatus = 'active' | 'inactive' | 'withdrawn';
type InstructorStatus = 'active' | 'inactive';
type ClassStatus = 'active' | 'closed';
type EnrollmentStatus = 'active' | 'dropped';
type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
type ConsultationType = 'phone' | 'visit' | 'online';

// 수정된 상태 타입
type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'overdue';  // [수정됨: partial 추가]
type PaymentMethod = 'cash' | 'card' | 'transfer';               // [추가됨]

// 신규 상태 타입 [추가됨]
type MakeupStatus = 'pending' | 'completed' | 'cancelled';
type WaitlistStatus = 'waiting' | 'enrolled' | 'cancelled';
type SalaryStatus = 'unpaid' | 'paid';
type HolidayType = 'public' | 'manual';
```

---

## 6. API 목록 (51개) [수정됨: 기존 32개 → 51개]

### 6.1 Student API (5개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 1 | GET | /api/students | 수강생 목록 (검색, 상태필터, 페이지네이션) |
| 2 | POST | /api/students | 수강생 등록 |
| 3 | GET | /api/students/[id] | 수강생 상세 (수강 반, 출석률, 수납내역 포함) |
| 4 | PUT | /api/students/[id] | 수강생 정보 수정 |
| 5 | DELETE | /api/students/[id] | 수강생 삭제 (연결 데이터 확인) |

### 6.2 Instructor API (4개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 6 | GET | /api/instructors | 강사 목록 |
| 7 | POST | /api/instructors | 강사 등록 |
| 8 | PUT | /api/instructors/[id] | 강사 수정 |
| 9 | DELETE | /api/instructors/[id] | 강사 삭제 (담당 반 확인) |

### 6.3 Class API (5개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 10 | GET | /api/classes | 반 목록 (현재 수강생 수 포함) |
| 11 | POST | /api/classes | 반 생성 (시간표 충돌 검증) |
| 12 | GET | /api/classes/[id] | 반 상세 (수강생 목록, 출석현황 포함) |
| 13 | PUT | /api/classes/[id] | 반 수정 (시간표 충돌 재검증) |
| 14 | DELETE | /api/classes/[id] | 반 삭제 (수강생 있으면 불가) |

### 6.4 Enrollment API (4개) [수정됨: 3개 → 4개]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 15 | POST | /api/enrollments | 수강 등록 (정원 확인, 충돌 검사) [수정됨] |
| 16 | PATCH | /api/enrollments/[id]/drop | 수강 취소 |
| 17 | GET | /api/enrollments | 수강 현황 목록 (반별/수강생별 필터) |
| 18 | POST | /api/enrollments/check-conflict | 시간표 충돌 검사 [추가됨] |

### 6.5 Attendance API (4개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 19 | GET | /api/attendance | 출석 목록 (반+날짜 필터) |
| 20 | POST | /api/attendance/bulk | 일괄 출석 체크 (반 전체) |
| 21 | PUT | /api/attendance/[id] | 출석 상태 수정 |
| 22 | GET | /api/attendance/stats | 출석 통계 (수강생별 출석률) |

### 6.6 Payment API (6개) [수정됨: 4개 → 6개]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 23 | GET | /api/payments | 수납 목록 (월별, 상태별 필터) |
| 24 | POST | /api/payments | 수납 등록 (일할계산 지원) [수정됨] |
| 25 | PATCH | /api/payments/[id]/pay | 납부 처리 (전액/반액 선택) [수정됨] |
| 26 | GET | /api/payments/unpaid | 미납 목록 (수강생+반 정보 포함) |
| 27 | POST | /api/payments/calculate-prorated | 일할 계산 API [추가됨] |
| 28 | GET | /api/payments/[id] | 수납 상세 [추가됨] |

### 6.7 Refund API (2개) [추가됨]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 29 | POST | /api/refunds | 환불 처리 |
| 30 | GET | /api/refunds | 환불 목록 |

### 6.8 Consultation API (3개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 31 | GET | /api/consultations | 상담 기록 목록 (수강생별 필터) |
| 32 | POST | /api/consultations | 상담 기록 등록 |
| 33 | DELETE | /api/consultations/[id] | 상담 기록 삭제 |

### 6.9 MakeupClass API (3개) [추가됨]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 34 | GET | /api/makeup-classes | 보강 목록 |
| 35 | POST | /api/makeup-classes | 보강 예약 |
| 36 | PATCH | /api/makeup-classes/[id] | 보강 상태 변경 (완료/취소) |

### 6.10 Waitlist API (4개) [추가됨]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 37 | GET | /api/waitlist | 대기자 목록 (반별 필터) |
| 38 | POST | /api/waitlist | 대기 등록 |
| 39 | PATCH | /api/waitlist/[id]/enroll | 대기자 수강 전환 |
| 40 | DELETE | /api/waitlist/[id] | 대기 취소 |

### 6.11 InstructorSalary API (4개) [추가됨]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 41 | GET | /api/instructor-salaries | 급여 목록 (월별, 강사별 필터) |
| 42 | POST | /api/instructor-salaries | 급여 등록 |
| 43 | PATCH | /api/instructor-salaries/[id]/pay | 급여 지급 처리 |
| 44 | GET | /api/instructor-salaries/stats | 급여 통계 |

### 6.12 Holiday API (4개) [추가됨]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 45 | GET | /api/holidays | 휴일 목록 (연도별 필터) |
| 46 | POST | /api/holidays | 휴일 등록 |
| 47 | DELETE | /api/holidays/[id] | 휴일 삭제 |
| 48 | POST | /api/holidays/init-public | 공휴일 자동 등록 [추가됨] |

### 6.13 Dashboard & Schedule API (5개) [수정됨: 4개 → 5개]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 49 | GET | /api/dashboard | 대시보드 통계 (미납자 목록, 리마인더 포함) [수정됨] |
| 50 | GET | /api/schedule/weekly | 주간 시간표 [수정됨: 경로 변경] |
| 51 | GET | /api/schedule/monthly | 월간 시간표 [추가됨] |
| 52 | GET | /api/settings | 학원 설정 조회 |
| 53 | PUT | /api/settings | 학원 설정 수정 |

### 6.14 Search & Export API (4개) [추가됨]
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 54 | GET | /api/search | 통합 검색 (수강생/반/강사) |
| 55 | GET | /api/export/students | 수강생 Excel 내보내기 |
| 56 | GET | /api/export/payments | 수납 Excel 내보내기 |
| 57 | GET | /api/export/attendance | 출석 Excel 내보내기 |

### 6.15 Backup API (2개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 58 | GET | /api/backup | 데이터 백업 (JSON 다운로드) |
| 59 | POST | /api/backup | 데이터 복원 (JSON 업로드) |

> **총 59개 API**

---

## 7. 상태 전이 규칙 (6개) [수정됨: 3개 → 6개]

### 7.1 수강생 상태 (StudentStatus)
```
active → inactive (수강 일시중단)
active → withdrawn (퇴원)
inactive → active (복원)
withdrawn → 변경 불가
```
- [추가됨] inactive 상태에서는 새 수납 건 생성 불가

### 7.2 수납 상태 (PaymentStatus) [수정됨]
```
unpaid → paid (전액 납부)
unpaid → partial (반액 납부) [추가됨]
unpaid → overdue (자동: 해당월 마지막날 경과)
partial → paid (잔액 납부) [추가됨]
overdue → paid (연체 후 납부)
overdue → partial (연체 후 반액 납부) [추가됨]
paid → 변경 불가 (환불은 Refund 엔티티로 처리)
```

### 7.3 수강등록 상태 (EnrollmentStatus)
```
active → dropped (수강 취소)
dropped → 변경 불가 (재등록은 새로 생성)
```

### 7.4 보강 상태 (MakeupStatus) [추가됨]
```
pending → completed (보강 완료)
pending → cancelled (보강 취소)
completed → 변경 불가
cancelled → 변경 불가
```

### 7.5 대기자 상태 (WaitlistStatus) [추가됨]
```
waiting → enrolled (자리 발생 시 수강 전환)
waiting → cancelled (대기 취소)
enrolled → 변경 불가
cancelled → 변경 불가
```

### 7.6 급여 상태 (SalaryStatus) [추가됨]
```
unpaid → paid (지급 처리)
paid → 변경 불가
```

---

## 8. 비즈니스 규칙 [수정됨: 대폭 확장]

### 8.1 반 생성/수정
- 시간표 충돌 검증: 같은 강사가 같은 요일+시간에 다른 반 불가
- 같은 교실이 같은 요일+시간에 다른 반 불가 (roomId가 있는 경우)
- 정원(maxStudents) 초과 수강 등록 불가 → 자동으로 대기자 등록 [수정됨]

### 8.2 수강 등록 [수정됨]
- 한 수강생이 같은 반에 중복 등록 불가
- 수강생 상태가 withdrawn이면 등록 불가
- 반 상태가 closed이면 등록 불가
- [추가됨] 정원 초과 시 등록 불가, 대기자로 자동 전환
- [추가됨] 수강생의 기존 수강 반과 시간표 충돌 시 경고 표시

### 8.3 출석 [수정됨]
- 해당 반에 수강 중인(active enrollment) 수강생만 출석 체크 가능
- 같은 날 같은 반에 같은 수강생 중복 출석 불가
- 출석률 = present 수 / 전체 출석일 수 × 100
- [추가됨] 휴일(Holiday)로 등록된 날짜는 출석 체크 불가

### 8.4 수납 [수정됨]
- 같은 수강생+같은 반+같은 월에 중복 수납 불가
- 금액은 양수만
- [추가됨] inactive 상태 수강생은 새 수납 생성 불가
- [추가됨] 부분 납부는 전액/반액(50%)만 선택 가능
- [추가됨] 월 중간 등록 시 일할 계산 자동 적용 (남은 수업 횟수 기준)

### 8.5 삭제 제약
- 수강생: active enrollment이 있으면 삭제 불가
- 강사: 담당 반(active class)이 있으면 삭제 불가
- 반: active enrollment이 있으면 삭제 불가

### 8.6 보강 [추가됨]
- 같은 반의 다른 시간대에만 보강 예약 가능
- 결석 기록(absent)이 있는 날짜에 대해서만 보강 예약 가능
- 휴일에는 보강 예약 불가

### 8.7 대기자 [추가됨]
- 한 수강생이 같은 반에 중복 대기 등록 불가
- 대기 우선순위는 등록 순서(FIFO)로 자동 결정
- 자리 발생 시 우선순위가 가장 높은 대기자에게 알림 표시

### 8.8 환불 [추가됨]
- paid 또는 partial 상태의 수납 건에 대해서만 환불 가능
- 환불 금액은 납부 금액(paidAmount) 이하만 가능
- 환불 처리 후에도 원 수납 기록은 유지

### 8.9 급여 [추가됨]
- 같은 강사+같은 월에 중복 급여 등록 불가
- 급여 금액은 강사의 monthlySalary 기준 (수정 가능)

---

## 9. 대시보드 통계 [수정됨]

| 항목 | 설명 |
|------|------|
| totalStudents | 전체 수강생 수 (active) |
| totalClasses | 운영 중 반 수 (active) |
| totalInstructors | 활동 강사 수 (active) |
| monthlyRevenue | 이번 달 수납 합계 (paid + partial) |
| unpaidCount | 미납 건수 |
| unpaidAmount | 미납 금액 합계 |
| unpaidList | 미납자 목록 (이름, 반, 금액) [추가됨] |
| averageAttendanceRate | 전체 평균 출석률 |
| recentConsultations | 최근 상담 5건 |
| todaySchedule | 오늘 수업 목록 |
| todayReminders | 오늘 후속 조치 목록 [추가됨] |
| enrollmentTrend | 최근 6개월 수강 등록 추이 |
| waitlistCount | 대기자 현황 [추가됨] |

---

## 10. 기술 스택

| 항목 | 기술 |
|------|------|
| 프레임워크 | Next.js (App Router) |
| 언어 | TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| 차트 | Recharts |
| 알림 | Sonner |
| 폼 | React Hook Form + Zod |
| 아이콘 | Lucide React |
| 날짜 | date-fns |
| Excel | xlsx (SheetJS) [추가됨] |
| 저장소 | data/db.json (fs 기반) |

---

## 11. Backend First 전략

### Phase A: Backend (API Routes 59개)
1. Storage & Types (엔티티 13개, 상수, 유틸리티)
2. Settings API + Master Data
3. Student API (5개)
4. Instructor API (4개) + InstructorSalary API (4개)
5. Class API (5개) + Enrollment API (4개)
6. Attendance API (4개) + MakeupClass API (3개)
7. Payment API (6개) + Refund API (2개)
8. Consultation API (3개) + Holiday API (4개)
9. Waitlist API (4개)
10. Dashboard & Schedule API (5개) + Search & Export API (4개)
11. Backup API (2개)
12. **curl 전체 테스트 (59개)**

### Phase B: Frontend
13. Layout & Navigation (통합 검색 포함) [수정됨]
14. Common Components
15. Settings & Master Data Pages [추가됨]
16. Instructor & Student Pages
17. Class & Enrollment Pages (대기자 포함) [수정됨]
18. Attendance & MakeupClass Pages [수정됨]
19. Payment & Refund Pages [수정됨]
20. InstructorSalary Pages [추가됨]
21. Consultation & Dashboard Pages (리마인더 포함) [수정됨]
22. Schedule View (주간 + 월간) [수정됨]
23. Holiday Management [추가됨]
24. Export Features [추가됨]
25. Polish & Testing

---

## 12. 제약사항

- 싱글 유저 (인증 없음)
- 데스크톱 전용 (반응형 제외)
- 알림/문자 발송 없음 (미납 확인은 화면에서만)
- 성적 관리 없음
- 교재/자료 관리 없음
- [추가됨] 할인 정책 없음 (형제자매/다중수업 할인 미지원)
- [추가됨] 수강생 사진 없음
- [추가됨] 수납 자동 생성 없음 (수동 등록만)

---

## 13. 주요 페이지 (10개) [수정됨: 7개 → 10개]

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 대시보드 | / | 통계 카드, 오늘 시간표, 미납 목록, 리마인더 [수정됨] |
| 수강생 | /students | 목록/등록/상세/수정 |
| 강사 | /instructors | 목록/등록/수정 |
| 반 관리 | /classes | 목록/생성/상세(수강생, 대기자 포함) [수정됨] |
| 출석 | /attendance | 반 선택 → 날짜별 출석 체크, 보강 예약 [수정됨] |
| 수납 | /payments | 월별 수납 현황, 미납 목록, 환불 처리 [수정됨] |
| 급여 | /salaries | 강사별 급여 관리 [추가됨] |
| 시간표 | /schedule | 주간/월간 시간표 [추가됨] |
| 휴일 | /holidays | 공휴일/휴원일 관리 [추가됨] |
| 설정 | /settings | 학원 정보, 마스터 데이터, 백업/복원 [수정됨] |

> 상담 기록은 수강생 상세 페이지 내 탭으로 표시

---

## 14. 상수 정의 [추가됨]

```typescript
// 페이지네이션
const PAGE_SIZE = 10;  // [수정됨: 20 → 10]

// 수납 방법 (고정)
const PAYMENT_METHODS = ['cash', 'card', 'transfer'] as const;

// 부분 납부 비율
const PARTIAL_PAYMENT_RATIO = 0.5;  // 50%

// 대시보드 표시 건수
const DASHBOARD_RECENT_COUNT = 5;
const DASHBOARD_UNPAID_LIMIT = 10;

// 공휴일 (한국 2024-2026)
// 설정에서 연도별 자동 등록 기능 제공
```

---

## 15. 데이터 저장소 구조 [수정됨]

```typescript
interface Database {
  // 기본 엔티티
  students: Student[];
  instructors: Instructor[];
  classes: Class[];
  enrollments: Enrollment[];
  attendances: Attendance[];
  payments: Payment[];
  consultations: Consultation[];

  // 신규 엔티티 [추가됨]
  makeupClasses: MakeupClass[];
  waitlists: Waitlist[];
  instructorSalaries: InstructorSalary[];
  holidays: Holiday[];
  refunds: Refund[];

  // 설정
  settings: Settings;
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|----------|
| 1.0 | - | 초기 SRS 작성 |
| FINAL | 2026-02-02 | 인터뷰 결과 반영 |
