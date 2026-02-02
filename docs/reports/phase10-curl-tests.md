# Phase 10 curl 테스트 가이드

## 사전 준비
```bash
# 개발 서버 실행
npm run dev

# 포트 확인: http://localhost:3000
```

## 1. Dashboard API

### GET /api/dashboard
```bash
curl http://localhost:3000/api/dashboard
```

**예상 응답:**
```json
{
  "data": {
    "totalStudents": 10,
    "totalInstructors": 5,
    "totalClasses": 8,
    "activeEnrollments": 25,
    "monthlyRevenue": 5000000,
    "unpaidList": [
      {
        "id": "pay-xxx",
        "studentId": "stu-xxx",
        "studentName": "김철수",
        "classId": "cls-xxx",
        "className": "수학 기초반",
        "amount": 200000,
        "month": "2026-02",
        "status": "unpaid"
      }
    ],
    "todaySchedule": [
      {
        "id": "cls-xxx",
        "name": "수학 기초반",
        "instructorName": "박선생",
        "room": "room-1",
        "enrollmentCount": 8,
        "maxStudents": 10,
        "schedules": [
          {
            "startTime": "14:00",
            "endTime": "16:00"
          }
        ]
      }
    ],
    "todayReminders": [
      {
        "id": "con-xxx",
        "studentId": "stu-xxx",
        "studentName": "김철수",
        "nextActionDate": "2026-02-01",
        "nextAction": "상담 예정",
        "type": "phone"
      }
    ],
    "enrollmentTrend": [
      {"month": "2025-09", "count": 5},
      {"month": "2025-10", "count": 8},
      {"month": "2025-11", "count": 12},
      {"month": "2025-12", "count": 10},
      {"month": "2026-01", "count": 15},
      {"month": "2026-02", "count": 3}
    ]
  }
}
```

---

## 2. Weekly Schedule API

### GET /api/schedule/weekly (오늘 기준)
```bash
curl http://localhost:3000/api/schedule/weekly
```

### GET /api/schedule/weekly (특정 날짜)
```bash
curl "http://localhost:3000/api/schedule/weekly?date=2026-02-02"
```

**예상 응답:**
```json
{
  "data": [
    {
      "dayOfWeek": 0,
      "classes": []
    },
    {
      "dayOfWeek": 1,
      "classes": [
        {
          "id": "cls-xxx",
          "name": "수학 기초반",
          "instructorId": "ins-xxx",
          "instructorName": "박선생",
          "roomId": "room-1",
          "enrollmentCount": 8,
          "maxStudents": 10,
          "startTime": "14:00",
          "endTime": "16:00"
        }
      ]
    },
    {
      "dayOfWeek": 2,
      "classes": [...]
    }
  ],
  "weekRange": {
    "start": "2026-02-02",
    "end": "2026-02-08"
  }
}
```

---

## 3. Monthly Schedule API

### GET /api/schedule/monthly (이번 달)
```bash
curl http://localhost:3000/api/schedule/monthly
```

### GET /api/schedule/monthly (특정 월)
```bash
curl "http://localhost:3000/api/schedule/monthly?year=2026&month=2"
```

**예상 응답:**
```json
{
  "data": [
    {
      "date": "2026-02-01",
      "dayOfWeek": 0,
      "isHoliday": false,
      "holidayName": null,
      "classes": []
    },
    {
      "date": "2026-02-02",
      "dayOfWeek": 1,
      "isHoliday": false,
      "holidayName": null,
      "classes": [
        {
          "id": "cls-xxx",
          "name": "수학 기초반",
          "instructorId": "ins-xxx",
          "instructorName": "박선생",
          "roomId": "room-1",
          "enrollmentCount": 8,
          "maxStudents": 10,
          "startTime": "14:00",
          "endTime": "16:00"
        }
      ]
    },
    {
      "date": "2026-02-03",
      "dayOfWeek": 2,
      "isHoliday": true,
      "holidayName": "설날",
      "classes": [...]
    }
  ]
}
```

---

## 4. Search API

### 성공 케이스
```bash
curl "http://localhost:3000/api/search?q=김철수"
```

**예상 응답:**
```json
{
  "data": {
    "students": [
      {
        "id": "stu-xxx",
        "name": "김철수",
        "phone": "010-1234-5678",
        "status": "active",
        "enrollDate": "2026-01-01"
      }
    ],
    "classes": [],
    "instructors": []
  },
  "totalCount": 1
}
```

### 검색어 없음 (에러)
```bash
curl "http://localhost:3000/api/search"
```

**예상 응답:** 400 Bad Request
```json
{
  "error": "검색 키워드를 입력해주세요.",
  "code": "QUERY_REQUIRED"
}
```

---

## 5. Backup API

### GET /api/backup (다운로드)
```bash
curl http://localhost:3000/api/backup --output backup.json
```

**파일 생성 확인:**
```bash
cat backup.json | jq '.version, .exportedAt' | head -2
# "1.0"
# "2026-02-02T10:30:00.000Z"
```

### POST /api/backup (복원)
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d @backup.json
```

**예상 응답:**
```json
{
  "message": "데이터가 성공적으로 복원되었습니다.",
  "stats": {
    "students": 10,
    "instructors": 5,
    "classes": 8,
    "enrollments": 25,
    "payments": 40,
    "attendances": 150,
    "consultations": 12,
    "makeupClasses": 3,
    "waitlists": 2,
    "instructorSalaries": 15,
    "holidays": 10,
    "refunds": 1
  }
}
```

### 잘못된 백업 형식 (에러)
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{"invalid": "data"}'
```

**예상 응답:** 400 Bad Request
```json
{
  "error": "잘못된 백업 파일 형식입니다.",
  "code": "INVALID_BACKUP_FORMAT"
}
```

---

## 6. Export Students API

### 전체 수강생
```bash
curl "http://localhost:3000/api/export/students" --output students.csv
```

### 활성 수강생만
```bash
curl "http://localhost:3000/api/export/students?status=active" --output students-active.csv
```

**CSV 내용 확인:**
```bash
head -5 students.csv
# "이름","전화번호","학부모 전화번호","레벨","등록일","상태","비고"
# "김철수","010-1234-5678","010-8765-4321","초급","2026-01-01","활성",""
# "이영희","010-2345-6789","010-9876-5432","중급","2026-01-02","활성",""
```

---

## 7. Export Payments API

### 전체 수납 내역
```bash
curl "http://localhost:3000/api/export/payments" --output payments.csv
```

### 특정 월 수납 내역
```bash
curl "http://localhost:3000/api/export/payments?month=2026-02" --output payments-2026-02.csv
```

**CSV 내용 확인:**
```bash
head -5 payments.csv
# "수강생명","반명","청구금액","납입금액","상태","월","납입일","납입방법","할인(정률)","비고"
# "김철수","수학 기초반","200000","200000","완납","2026-02","2026-02-01","현금","",""
# "이영희","영어 중급반","250000","125000","부분납부","2026-02","2026-02-05","카드","",""
```

---

## 8. Export Attendance API

### 출석 내역 (classId 필수)
```bash
curl "http://localhost:3000/api/export/attendance?classId=cls-xxx" --output attendance.csv
```

**CSV 내용 확인:**
```bash
head -5 attendance.csv
# "반명: 수학 기초반"
# ""
# "날짜","수강생명","출석상태","비고"
# "2026-02-01","김철수","출석",""
# "2026-02-01","이영희","지각","10분 지각"
```

### classId 없음 (에러)
```bash
curl "http://localhost:3000/api/export/attendance" --output attendance.csv
```

**예상 응답:** 400 Bad Request
```json
{
  "error": "반 ID를 입력해주세요.",
  "code": "CLASS_ID_REQUIRED"
}
```

### 존재하지 않는 반 (에러)
```bash
curl "http://localhost:3000/api/export/attendance?classId=invalid-id" --output attendance.csv
```

**예상 응답:** 404 Not Found
```json
{
  "error": "반을 찾을 수 없습니다.",
  "code": "CLASS_NOT_FOUND"
}
```

---

## 통합 테스트 시나리오

### 시나리오: 대시보드 → 검색 → 내보내기 → 백업

```bash
# 1. 대시보드 확인
curl http://localhost:3000/api/dashboard | jq '.data.totalStudents'

# 2. 수강생 검색
curl "http://localhost:3000/api/search?q=김철수" | jq '.totalCount'

# 3. 수강생 목록 내보내기
curl "http://localhost:3000/api/export/students?status=active" --output students.csv

# 4. 수납 내역 내보내기 (이번 달)
CURRENT_MONTH=$(date +%Y-%m)
curl "http://localhost:3000/api/export/payments?month=${CURRENT_MONTH}" --output payments.csv

# 5. 전체 백업
curl http://localhost:3000/api/backup --output backup-$(date +%Y%m%d).json

# 6. CSV 파일 확인
ls -lh *.csv *.json
```

---

## 에러 케이스 확인

### 1. Search - 키워드 없음
```bash
curl "http://localhost:3000/api/search" -w "\nStatus: %{http_code}\n"
# 예상: Status: 400
```

### 2. Monthly Schedule - 잘못된 월
```bash
curl "http://localhost:3000/api/schedule/monthly?year=2026&month=13" -w "\nStatus: %{http_code}\n"
# 예상: Status: 400
```

### 3. Export Attendance - classId 없음
```bash
curl "http://localhost:3000/api/export/attendance" -w "\nStatus: %{http_code}\n"
# 예상: Status: 400
```

### 4. Backup Restore - 잘못된 형식
```bash
curl -X POST http://localhost:3000/api/backup \
  -H "Content-Type: application/json" \
  -d '{}' \
  -w "\nStatus: %{http_code}\n"
# 예상: Status: 400
```

---

## 성능 테스트

### Dashboard 응답 시간
```bash
time curl -s http://localhost:3000/api/dashboard > /dev/null
# 예상: < 100ms
```

### Search 응답 시간
```bash
time curl -s "http://localhost:3000/api/search?q=test" > /dev/null
# 예상: < 50ms
```

### Monthly Schedule 응답 시간
```bash
time curl -s "http://localhost:3000/api/schedule/monthly?year=2026&month=2" > /dev/null
# 예상: < 100ms
```

---

## CSV 파일 확인 (Excel)

### Windows
```bash
start students.csv
start payments.csv
start attendance.csv
```

### macOS
```bash
open students.csv
open payments.csv
open attendance.csv
```

### Linux
```bash
xdg-open students.csv
xdg-open payments.csv
xdg-open attendance.csv
```

---

## 정리

### 생성된 파일 삭제
```bash
rm -f *.csv *.json
```

### 개발 서버 종료
```bash
# Ctrl+C
```

---

## 체크리스트

- [ ] Dashboard 정상 응답
- [ ] Weekly Schedule 정상 응답
- [ ] Monthly Schedule 정상 응답 + 휴일 표시
- [ ] Search 정상 검색 (students, classes, instructors)
- [ ] Backup 다운로드 성공 (JSON 파일)
- [ ] Backup 복원 성공
- [ ] Students CSV 다운로드 성공 (한글 정상)
- [ ] Payments CSV 다운로드 성공 (한글 정상)
- [ ] Attendance CSV 다운로드 성공 (한글 정상)
- [ ] 에러 케이스 정상 처리 (400, 404)
- [ ] 응답 시간 100ms 이내
