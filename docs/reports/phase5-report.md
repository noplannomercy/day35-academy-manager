# Phase 5 완료 보고서

## 생성된 파일
- [x] src/app/api/classes/route.ts (GET, POST)
- [x] src/app/api/classes/[id]/route.ts (GET, PUT, DELETE)
- [x] src/app/api/enrollments/route.ts (GET, POST)
- [x] src/app/api/enrollments/[id]/drop/route.ts (PATCH)
- [x] src/app/api/enrollments/check-conflict/route.ts (POST)
- [x] src/lib/storage.ts - createWaitlist() 함수 추가

## 빌드 결과
- npm run build: 성공
- 에러: 없음

## API Route 검증
- route.ts 파일 수: 13개 (예상: 13개)
- Phase 1-4 누적: 8개 (settings, students 2, instructors 2, salaries 3)
- Phase 5 신규: 5개 (classes 2, enrollments 3)

## 구현된 API 엔드포인트 (9개)

### Class API (5개)
1. GET /api/classes - 반 목록 조회 (필터: status, subjectId, instructorId)
2. POST /api/classes - 반 생성 (시간표 충돌 검증)
3. GET /api/classes/[id] - 반 상세 조회 (수강생, 대기자, 최근 출석)
4. PUT /api/classes/[id] - 반 수정 (시간표 충돌 재검증)
5. DELETE /api/classes/[id] - 반 삭제 (활성 수강생 존재 시 차단)

### Enrollment API (4개)
6. GET /api/enrollments - 수강 현황 목록 (필터: classId, studentId, status)
7. POST /api/enrollments - 수강 등록 (정원 확인, 충돌 검사)
8. PATCH /api/enrollments/[id]/drop - 수강 취소
9. POST /api/enrollments/check-conflict - 시간표 충돌 검사

## 핵심 비즈니스 로직 구현

### 1. 시간표 충돌 검증
- 반 생성/수정 시 checkScheduleConflict() 사용
- 같은 강사의 다른 반과 시간 겹침 확인
- 같은 교실의 다른 반과 시간 겹침 확인
- 에러 코드: INSTRUCTOR_SCHEDULE_CONFLICT, ROOM_SCHEDULE_CONFLICT
- 자기 자신 제외: excludeClassId 파라미터 사용

### 2. 정원 초과 시 대기자 자동 전환
- Enrollment 생성 시 현재 active enrollments 수 확인
- maxStudents 초과 시:
  - Enrollment 생성하지 않음
  - createWaitlist()로 Waitlist 생성 (FIFO priority 자동 계산)
  - 409 Conflict 반환 (code: CLASS_FULL_WAITLISTED)
  - data에 생성된 Waitlist 포함

### 3. 수강생 시간표 충돌 경고
- Enrollment 생성 시:
  - 학생의 다른 active enrollments 조회
  - 각 enrollment의 class 시간표와 비교
  - 충돌 발견 시:
    - Enrollment은 생성 (차단하지 않음)
    - 200 OK 반환
    - warning 필드 추가
    - conflicts 배열 포함

### 4. createWaitlist() 함수 추가
- storage.ts에 추가
- FIFO priority 자동 계산 (같은 class의 waiting 상태 대기자 수 + 1)
- Waitlist 생성 후 DB 저장 및 반환

## Validation 스키마 사용
- classCreateSchema: name, subjectId, instructorId, maxStudents, schedule, monthlyFee 필수
- classUpdateSchema: 모든 필드 optional
- enrollmentCreateSchema: studentId, classId 필수
- enrollmentConflictCheckSchema: studentId, classId 필수

## Next.js 15+ 호환성
- 동적 route params를 Promise로 처리
- params: Promise<{ id: string }> 타입 사용
- await params로 값 추출

## 데이터 농화 (Enrichment)
- GET /api/classes: instructor, subject, room, currentStudents, waitlistCount 포함
- GET /api/classes/[id]: 수강생 + attendanceRate + paymentStatus, 대기자 목록, 최근 출석 10개
- GET /api/enrollments: student, class 정보 포함

## 에러 처리
- 409 Conflict: 시간표 충돌, 정원 초과(대기자), 중복 등록, 활성 수강생 존재
- 400 Bad Request: validation 실패, 퇴원 학생, 종료된 반
- 404 Not Found: 리소스 없음
- 500 Internal Server Error: 서버 오류

## Testing Checklist (빌드 검증)
- [x] npm run build 성공
- [x] 13개 API route 파일 확인
- [x] TypeScript 컴파일 오류 없음
- [x] Next.js 15+ params Promise 호환성 확인

## Acceptance Criteria 충족
- [x] 9개 API 모두 구현
- [x] 시간표 충돌 (강사, 교실) 검증 로직
- [x] 정원 초과 → 대기자 전환 로직
- [x] 수강생 시간표 충돌 경고 로직
- [x] createWaitlist() 함수 추가

## 발견된 이슈
- Next.js 15+의 async params 처리 필요 (수정 완료)
- storage.ts에 createWaitlist() 함수 추가 필요 (추가 완료)

## 구현 특이사항
1. timeToMinutes() 헬퍼 함수를 enrollments/route.ts와 check-conflict/route.ts에 중복 정의
   - 각 파일에서 로컬로 사용 (utils.ts에 추가할 수도 있으나 현재는 중복 유지)

2. storage.ts의 createWaitlist()는 generateId를 require()로 동적 import
   - import 순환 참조 방지

3. 반 상세 조회 시 paymentStatus는 현재 월(YYYY-MM) 기준으로 조회

## Phase 6 진행 가능
예

## 다음 단계
Phase 6: Attendance API (4개) + MakeupClass API (2개)
- 출석 체크 (휴일 차단, 중복 차단)
- 일괄 출석 처리
- 보강 수업 예약 및 관리
