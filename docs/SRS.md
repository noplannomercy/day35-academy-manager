# Day 35: 학원 관리 시스템 - SRS (Software Requirements Specification)

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

## 3. 엔티티 정의 (8개)

### 3.1 Student (수강생)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| name | string | ✅ | 이름 |
| phone | string | ✅ | 연락처 |
| parentPhone | string | | 학부모 연락처 |
| email | string | | 이메일 |
| birthDate | string | | 생년월일 (YYYY-MM-DD) |
| grade | string | | 학년/레벨 (예: 중1, 초급) |
| status | StudentStatus | 자동 | active / inactive / withdrawn |
| enrollDate | string | 자동 | 등록일 |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.2 Instructor (강사)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| name | string | ✅ | 이름 |
| phone | string | ✅ | 연락처 |
| email | string | | 이메일 |
| subject | string | ✅ | 담당 과목 |
| status | InstructorStatus | 자동 | active / inactive |
| color | string | | 시간표 표시 색상 (hex) |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.3 Class (반/수업)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| name | string | ✅ | 반 이름 (예: 중등수학A반) |
| subject | string | ✅ | 과목 |
| instructorId | string | ✅ | 담당 강사 |
| maxStudents | number | ✅ | 정원 |
| schedule | Schedule[] | ✅ | 수업 일정 (요일+시간) |
| monthlyFee | number | ✅ | 월 수강료 |
| status | ClassStatus | 자동 | active / closed |
| room | string | | 교실명 |
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

### 3.7 Payment (수납)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| studentId | string | ✅ | 수강생 |
| classId | string | ✅ | 반 |
| amount | number | ✅ | 금액 |
| month | string | ✅ | 해당 월 (YYYY-MM) |
| status | PaymentStatus | 자동 | paid / unpaid / overdue |
| paidDate | string | | 납부일 |
| method | string | | 납부 방법 (현금/카드/계좌이체) |
| notes | string | | 비고 |
| createdAt | string | 자동 | |

### 3.8 Consultation (상담 기록)
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| id | string (UUID) | 자동 | |
| studentId | string | ✅ | 수강생 |
| date | string | ✅ | 상담일 (YYYY-MM-DD) |
| type | ConsultationType | ✅ | phone / visit / online |
| content | string | ✅ | 상담 내용 |
| nextAction | string | | 후속 조치 |
| createdAt | string | 자동 | |

---

## 4. API 목록 (28개)

### 4.1 Student API (5개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 1 | GET | /api/students | 수강생 목록 (검색, 상태필터, 페이지네이션) |
| 2 | POST | /api/students | 수강생 등록 |
| 3 | GET | /api/students/[id] | 수강생 상세 (수강 반, 출석률, 수납내역 포함) |
| 4 | PUT | /api/students/[id] | 수강생 정보 수정 |
| 5 | DELETE | /api/students/[id] | 수강생 삭제 (연결 데이터 확인) |

### 4.2 Instructor API (4개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 6 | GET | /api/instructors | 강사 목록 |
| 7 | POST | /api/instructors | 강사 등록 |
| 8 | PUT | /api/instructors/[id] | 강사 수정 |
| 9 | DELETE | /api/instructors/[id] | 강사 삭제 (담당 반 확인) |

### 4.3 Class API (5개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 10 | GET | /api/classes | 반 목록 (현재 수강생 수 포함) |
| 11 | POST | /api/classes | 반 생성 (시간표 충돌 검증) |
| 12 | GET | /api/classes/[id] | 반 상세 (수강생 목록, 출석현황 포함) |
| 13 | PUT | /api/classes/[id] | 반 수정 (시간표 충돌 재검증) |
| 14 | DELETE | /api/classes/[id] | 반 삭제 (수강생 있으면 불가) |

### 4.4 Enrollment API (3개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 15 | POST | /api/enrollments | 수강 등록 (정원 확인) |
| 16 | PATCH | /api/enrollments/[id]/drop | 수강 취소 |
| 17 | GET | /api/enrollments | 수강 현황 목록 (반별/수강생별 필터) |

### 4.5 Attendance API (4개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 18 | GET | /api/attendance | 출석 목록 (반+날짜 필터) |
| 19 | POST | /api/attendance/bulk | 일괄 출석 체크 (반 전체) |
| 20 | PUT | /api/attendance/[id] | 출석 상태 수정 |
| 21 | GET | /api/attendance/stats | 출석 통계 (수강생별 출석률) |

### 4.6 Payment API (4개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 22 | GET | /api/payments | 수납 목록 (월별, 상태별 필터) |
| 23 | POST | /api/payments | 수납 등록 |
| 24 | PATCH | /api/payments/[id]/pay | 납부 처리 (status → paid) |
| 25 | GET | /api/payments/unpaid | 미납 목록 (수강생+반 정보 포함) |

### 4.7 Consultation API (3개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 26 | GET | /api/consultations | 상담 기록 목록 (수강생별 필터) |
| 27 | POST | /api/consultations | 상담 기록 등록 |
| 28 | DELETE | /api/consultations/[id] | 상담 기록 삭제 |

### 4.8 Dashboard & Settings API (4개)
| # | Method | Endpoint | 설명 |
|---|--------|----------|------|
| 29 | GET | /api/dashboard | 대시보드 통계 |
| 30 | GET | /api/schedule | 주간 시간표 (전체 반) |
| 31 | GET | /api/settings | 학원 설정 조회 |
| 32 | PUT | /api/settings | 학원 설정 수정 |

> **총 32개 API** (초기 예상 28개보다 증가 - 관계 복잡도 반영)

---

## 5. 상태 전이 규칙 (3개)

### 5.1 수강생 상태 (StudentStatus)
```
active → inactive (수강 일시중단)
active → withdrawn (퇴원)
inactive → active (복원)
withdrawn → 변경 불가
```

### 5.2 수납 상태 (PaymentStatus)
```
unpaid → paid (납부 처리)
unpaid → overdue (자동: 해당월 마지막날 경과)
overdue → paid (연체 후 납부)
paid → 변경 불가
```

### 5.3 수강등록 상태 (EnrollmentStatus)
```
active → dropped (수강 취소)
dropped → 변경 불가 (재등록은 새로 생성)
```

---

## 6. 비즈니스 규칙

### 6.1 반 생성/수정
- 시간표 충돌 검증: 같은 강사가 같은 요일+시간에 다른 반 불가
- 같은 교실이 같은 요일+시간에 다른 반 불가 (room이 있는 경우)
- 정원(maxStudents) 초과 수강 등록 불가

### 6.2 수강 등록
- 한 수강생이 같은 반에 중복 등록 불가
- 수강생 상태가 withdrawn이면 등록 불가
- 반 상태가 closed이면 등록 불가

### 6.3 출석
- 해당 반에 수강 중인(active enrollment) 수강생만 출석 체크 가능
- 같은 날 같은 반에 같은 수강생 중복 출석 불가
- 출석률 = present 수 / 전체 출석일 수 × 100

### 6.4 수납
- 같은 수강생+같은 반+같은 월에 중복 수납 불가
- 금액은 양수만

### 6.5 삭제 제약
- 수강생: active enrollment이 있으면 삭제 불가
- 강사: 담당 반(active class)이 있으면 삭제 불가
- 반: active enrollment이 있으면 삭제 불가

---

## 7. 대시보드 통계

| 항목 | 설명 |
|------|------|
| totalStudents | 전체 수강생 수 (active) |
| totalClasses | 운영 중 반 수 (active) |
| totalInstructors | 활동 강사 수 (active) |
| monthlyRevenue | 이번 달 수납 합계 (paid) |
| unpaidCount | 미납 건수 |
| unpaidAmount | 미납 금액 합계 |
| averageAttendanceRate | 전체 평균 출석률 |
| recentConsultations | 최근 상담 5건 |
| todaySchedule | 오늘 수업 목록 |
| enrollmentTrend | 최근 6개월 수강 등록 추이 |

---

## 8. 기술 스택

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
| 저장소 | data/db.json (fs 기반) |

---

## 9. Backend First 전략

### Phase A: Backend (API Routes 32개)
1. Storage & Types (엔티티 8개, 상수, 유틸리티)
2. Student API (5개)
3. Instructor API (4개)
4. Class API (5개) + Enrollment API (3개)
5. Attendance API (4개) + Payment API (4개)
6. Consultation API (3개) + Dashboard & Settings API (4개)
7. **curl 전체 테스트 (32개)**

### Phase B: Frontend
8. Layout & Navigation
9. Common Components
10. Instructor & Student Pages
11. Class & Enrollment Pages
12. Attendance & Payment Pages
13. Consultation & Dashboard Pages
14. Schedule View & Polish

---

## 10. 제약사항

- 싱글 유저 (인증 없음)
- 데스크톱 전용 (반응형 제외)
- 알림/문자 발송 없음 (미납 확인은 화면에서만)
- 성적 관리 없음
- 교재/자료 관리 없음

---

## 11. 주요 페이지 (7개)

| 페이지 | 경로 | 설명 |
|--------|------|------|
| 대시보드 | / | 통계 카드, 오늘 시간표, 미납 알림 |
| 수강생 | /students | 목록/등록/상세/수정 |
| 강사 | /instructors | 목록/등록/수정 |
| 반 관리 | /classes | 목록/생성/상세(수강생 포함) |
| 출석 | /attendance | 반 선택 → 날짜별 출석 체크 |
| 수납 | /payments | 월별 수납 현황, 미납 목록 |
| 설정 | /settings | 학원 정보, 백업/복원 |

> 상담 기록은 수강생 상세 페이지 내 탭으로 표시