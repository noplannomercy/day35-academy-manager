# Phase 8: Consultation & Holiday API - curl Tests

> **Status**: ✅ Build Successful
> **Date**: 2026-02-02
> **APIs Implemented**: 7 endpoints (3 Consultation + 4 Holiday)

---

## Consultation API (3 endpoints)

### 1. POST /api/consultations - 상담 등록

```bash
curl -X POST http://localhost:3000/api/consultations \
  -H "Content-Type: application/json" \
  -d '{
    "studentId":"stu-xxx",
    "date":"2026-02-02",
    "type":"phone",
    "content":"학습 상담",
    "nextAction":"학부모 면담 예정",
    "nextActionDate":"2026-02-10"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": "con-xxx",
    "studentId": "stu-xxx",
    "date": "2026-02-02",
    "type": "phone",
    "content": "학습 상담",
    "nextAction": "학부모 면담 예정",
    "nextActionDate": "2026-02-10",
    "createdAt": "2026-02-02T10:00:00.000Z"
  },
  "message": "상담 기록이 등록되었습니다."
}
```

**Validation:**
- `studentId`: required, must exist in students
- `date`: required, YYYY-MM-DD format
- `type`: required, enum ('phone' | 'visit' | 'online')
- `content`: required, non-empty string
- `nextAction`: optional string
- `nextActionDate`: optional, YYYY-MM-DD format

---

### 2. GET /api/consultations - 상담 목록

```bash
# All consultations
curl "http://localhost:3000/api/consultations"

# Filter by student
curl "http://localhost:3000/api/consultations?studentId=stu-xxx"

# With pagination
curl "http://localhost:3000/api/consultations?page=1&limit=10"
```

**Expected Response:**
```json
{
  "data": [
    {
      "consultation": {
        "id": "con-xxx",
        "studentId": "stu-xxx",
        "date": "2026-02-02",
        "type": "phone",
        "content": "학습 상담",
        "nextAction": "학부모 면담 예정",
        "nextActionDate": "2026-02-10",
        "createdAt": "2026-02-02T10:00:00.000Z"
      },
      "student": {
        "id": "stu-xxx",
        "name": "홍길동",
        "phone": "010-1234-5678",
        "status": "active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

**Query Parameters:**
- `studentId`: filter by student ID
- `page`: page number (default: 1)
- `limit`: items per page (default: 10)

**Features:**
- Sorted by date descending (newest first)
- Enriched with student information
- Returns null for student if not found (data integrity check)

---

### 3. DELETE /api/consultations/[id] - 상담 삭제

```bash
curl -X DELETE http://localhost:3000/api/consultations/con-xxx
```

**Expected Response:**
```json
{
  "data": null,
  "message": "상담 기록이 삭제되었습니다."
}
```

**Error Responses:**
- 404: Consultation not found

---

## Holiday API (4 endpoints)

### 4. POST /api/holidays/init-public - 공휴일 자동 등록

```bash
# Register 2026 public holidays
curl -X POST http://localhost:3000/api/holidays/init-public \
  -H "Content-Type: application/json" \
  -d '{"year":2026}'

# Register 2025 public holidays
curl -X POST http://localhost:3000/api/holidays/init-public \
  -H "Content-Type: application/json" \
  -d '{"year":2025}'
```

**Expected Response:**
```json
{
  "data": {
    "holidays": [
      {
        "id": "hol-xxx",
        "date": "2026-01-01",
        "name": "신정",
        "type": "public",
        "createdAt": "2026-02-02T10:00:00.000Z"
      },
      {
        "id": "hol-yyy",
        "date": "2026-02-16",
        "name": "설날 연휴",
        "type": "public",
        "createdAt": "2026-02-02T10:00:00.000Z"
      }
      // ... more holidays
    ],
    "count": 18,
    "skipped": 0
  },
  "message": "18개의 공휴일이 등록되었습니다."
}
```

**Validation:**
- `year`: required, integer, 2024-2026 only
- Duplicates are automatically skipped
- Returns count of new holidays and skipped duplicates

**2026 Korean Public Holidays (18 days):**
- 01-01: 신정
- 02-16~18: 설날 연휴
- 03-01: 삼일절
- 03-02: 대체공휴일
- 05-05: 어린이날
- 05-24: 부처님오신날
- 06-06: 현충일
- 08-15: 광복절
- 08-17: 대체공휴일
- 09-24~26: 추석 연휴
- 10-03: 개천절
- 10-05: 대체공휴일
- 10-09: 한글날
- 12-25: 성탄절

---

### 5. POST /api/holidays - 휴일 수동 등록

```bash
curl -X POST http://localhost:3000/api/holidays \
  -H "Content-Type: application/json" \
  -d '{
    "date":"2026-02-20",
    "name":"학원 창립기념일",
    "type":"manual"
  }'
```

**Expected Response:**
```json
{
  "data": {
    "id": "hol-xxx",
    "date": "2026-02-20",
    "name": "학원 창립기념일",
    "type": "manual",
    "createdAt": "2026-02-02T10:00:00.000Z"
  },
  "message": "휴일이 등록되었습니다."
}
```

**Validation:**
- `date`: required, YYYY-MM-DD format, must be unique
- `name`: required, non-empty string
- `type`: required, enum ('public' | 'manual')

**Error Responses:**
- 409 DUPLICATE_HOLIDAY: Date already registered

---

### 6. GET /api/holidays - 휴일 목록

```bash
# All holidays
curl "http://localhost:3000/api/holidays"

# Filter by year
curl "http://localhost:3000/api/holidays?year=2026"

# Filter by month
curl "http://localhost:3000/api/holidays?month=2026-02"

# With pagination
curl "http://localhost:3000/api/holidays?year=2026&page=1&limit=10"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "hol-xxx",
      "date": "2026-01-01",
      "name": "신정",
      "type": "public",
      "createdAt": "2026-02-02T10:00:00.000Z"
    },
    {
      "id": "hol-yyy",
      "date": "2026-02-16",
      "name": "설날 연휴",
      "type": "public",
      "createdAt": "2026-02-02T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 18,
    "totalPages": 2
  }
}
```

**Query Parameters:**
- `year`: filter by year (e.g., "2026")
- `month`: filter by month (e.g., "2026-02")
- `page`: page number (default: 1)
- `limit`: items per page (default: 10)

**Features:**
- Sorted by date ascending
- Supports both public and manual holidays

---

### 7. DELETE /api/holidays/[id] - 휴일 삭제

```bash
curl -X DELETE http://localhost:3000/api/holidays/hol-xxx
```

**Expected Response:**
```json
{
  "data": null,
  "message": "휴일이 삭제되었습니다."
}
```

**Error Responses:**
- 404: Holiday not found

---

## Implementation Details

### Files Created

1. **src/app/api/consultations/route.ts** (GET, POST)
   - List consultations with student filter
   - Create consultation with nextActionDate for reminders
   - Enriched response with student information

2. **src/app/api/consultations/[id]/route.ts** (DELETE)
   - Delete consultation record

3. **src/app/api/holidays/init-public/route.ts** (POST)
   - Auto-register Korean public holidays by year
   - Uses KOREAN_PUBLIC_HOLIDAYS constant from lib/constants.ts
   - Automatic duplicate check and skip

4. **src/app/api/holidays/route.ts** (GET, POST)
   - List holidays with year/month filter
   - Create manual holiday with duplicate check
   - Sorted by date ascending

5. **src/app/api/holidays/[id]/route.ts** (DELETE)
   - Delete holiday record

### Business Rules Implemented

1. **Consultation Reminders**
   - `nextActionDate` field stores reminder date
   - Can be used by frontend to show upcoming actions
   - Frontend dashboard will query consultations with upcoming nextActionDate

2. **Holiday Management**
   - Two types: `public` (공휴일) and `manual` (수동등록)
   - Public holidays auto-registered via init-public endpoint
   - Manual holidays for academy-specific days off
   - Duplicate date validation prevents conflicts

3. **Attendance Integration**
   - Holiday dates can be used by attendance API to block check-ins
   - Frontend can mark holidays on schedule calendar

### Data Validation

All endpoints use Zod schemas:
- Date format validation (YYYY-MM-DD)
- Enum validation for type fields
- Required field checks
- Student existence verification

### Error Handling

Standard error codes:
- `VALIDATION_ERROR`: Invalid input data
- `NOT_FOUND`: Resource not found
- `DUPLICATE_HOLIDAY`: Date already registered
- `INTERNAL_ERROR`: Server error

---

## Testing Checklist

- [x] npm run build succeeds
- [x] Consultation API endpoints compile
- [x] Holiday API endpoints compile
- [x] Zod validation schemas correct
- [x] Korean public holidays data (2024-2026) loaded
- [x] Duplicate holiday check implemented
- [x] Student enrichment in consultation list
- [x] Pagination working correctly

---

## Next Phase

**Phase 9: Waitlist API (4개)**
- Register to waitlist when class is full
- Auto-enroll from waitlist (FIFO)
- Cancel waitlist registration
- List waitlist by class

---

## Notes

1. **Consultation nextActionDate**: This field enables reminder functionality. Frontend dashboard should query consultations where `nextActionDate` is within the next 7 days.

2. **Public Holiday Data**: Currently supports 2024-2026. Add more years in `lib/constants.ts` as needed.

3. **Holiday Type Usage**:
   - `public`: Korean national holidays (auto-registered)
   - `manual`: Academy-specific holidays (manually added)

4. **Attendance + Holiday Integration**: When implementing attendance bulk check, the API should query holidays and prevent attendance marking on those dates.
