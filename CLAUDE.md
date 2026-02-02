# Academy Manager (학원 관리 시스템)

## Project Overview
- **Purpose**: 소규모 학원의 수강생·강사·수업·수납·출석 통합 관리
- **Strategy**: Backend First (API → curl test → confirm → Frontend)
- **User**: Single user, no authentication | **Storage**: JSON file (`data/db.json`)

## Tech Stack
- Next.js 15 + TypeScript | shadcn/ui + Tailwind CSS | Recharts
- Forms: React Hook Form + Zod | Date: date-fns | Excel: xlsx (SheetJS)
- Storage: `lib/storage.ts` → `data/db.json`

## Development Strategy
```
Phase A: API Routes 59개 → curl 테스트 → 응답 확정
Phase B: Frontend → Layout → Components → Pages → API 연동
```

## Critical Constraints

| Rule | Constraint |
|------|------------|
| Pagination | 10 items/page |
| Payment methods | cash / card / transfer (fixed) |
| Partial payment | 50% only (full or half) |
| Instructor | Multiple subjects allowed (subjectIds[]) |
| Holiday | No attendance check allowed |
| Inactive student | No new payment creation |
| Class full | Auto-redirect to waitlist (FIFO) |

### Status Transitions (6 types)
- **Student**: active ↔ inactive → withdrawn (final)
- **Payment**: unpaid → partial/paid, unpaid → overdue → paid
- **Enrollment**: active → dropped (final)
- **Makeup**: pending → completed/cancelled
- **Waitlist**: waiting → enrolled/cancelled
- **Salary**: unpaid → paid

### Business Rules
- Schedule conflict: Same instructor/room at same time → block
- Enrollment: withdrawn student or closed class → block
- Attendance: Holiday → block, duplicate → block
- Payment: Same student+class+month duplicate → block
- Delete: Has active relations → block
- Prorated: Auto-calculate based on remaining class days

### Error Codes (see ARCHITECTURE.md §9)
`SCHEDULE_CONFLICT`, `CLASS_FULL_WAITLISTED`, `STUDENT_INACTIVE`, `HOLIDAY_NOT_ALLOWED`, `DUPLICATE_*`, `ACTIVE_*_EXISTS`, etc.

## Entities (13)
| Core | Relations | Additional |
|------|-----------|------------|
| Student | Enrollment | MakeupClass |
| Instructor | Attendance | Waitlist |
| Class | Payment | InstructorSalary |
| Settings | Consultation | Holiday |
|  | Refund |  |

## API Routes (59 total)
| Group | Count | Key Endpoints |
|-------|-------|---------------|
| Student | 5 | CRUD + detail with stats |
| Instructor | 4 | CRUD |
| Class | 5 | CRUD + schedule conflict validation |
| Enrollment | 4 | register, drop, conflict-check |
| Attendance | 4 | bulk check, stats |
| Payment | 6 | CRUD, pay (full/half), prorated calc |
| Refund | 2 | create, list |
| Consultation | 3 | CRUD |
| MakeupClass | 3 | reserve, status change |
| Waitlist | 4 | register, enroll, cancel |
| InstructorSalary | 4 | CRUD, pay, stats |
| Holiday | 4 | CRUD, init-public |
| Dashboard | 1 | stats + unpaid list + reminders |
| Schedule | 2 | weekly, monthly |
| Settings | 2 | get, update (master data included) |
| Search | 1 | global search |
| Export | 3 | students, payments, attendance (Excel) |
| Backup | 2 | export, import |

## Key Features
- **CRUD**: 13 entities with validation
- **Dashboard**: Stats, unpaid list, today schedule, reminders, enrollment trend
- **Schedule**: Weekly + Monthly view with holiday marking
- **Attendance**: Bulk check, holiday blocking, makeup reservation
- **Payment**: Prorated calculation, partial payment, refund
- **Waitlist**: Auto-enroll when vacancy, FIFO priority
- **Salary**: Fixed monthly, payment tracking
- **Settings**: Academy info + master data (levels, subjects, rooms, sources)
- **Search**: Global search (students, classes, instructors)
- **Export**: Excel download for students, payments, attendance

## Pages (10)
| Page | Path | Description |
|------|------|-------------|
| Dashboard | / | Stats, schedule, unpaid, reminders |
| Students | /students | List/New/Detail/Edit + tabs |
| Instructors | /instructors | List/New/Edit |
| Classes | /classes | List/New/Detail/Edit + waitlist |
| Attendance | /attendance | Class select → date → bulk check |
| Payments | /payments | List/Detail + pay/refund dialogs |
| Salaries | /salaries | List + pay dialog |
| Schedule | /schedule | Weekly/Monthly toggle |
| Holidays | /holidays | List + public holiday init |
| Settings | /settings | Academy info + master data + backup |

## File Structure
```
src/
├── app/
│   ├── api/           # 59 API Routes
│   ├── (routes)/      # 10 Pages
│   └── layout.tsx
├── components/
│   ├── layout/        # AppLayout, Sidebar, Header, GlobalSearch
│   ├── common/        # DataTable, Pagination, StatusBadge, etc.
│   └── [feature]/     # Feature-specific components
├── lib/
│   ├── storage.ts     # JSON read/write
│   ├── utils.ts       # Helpers
│   └── constants.ts   # PAGE_SIZE, STATUS_LABELS, etc.
└── types/index.ts     # All entity types
data/
└── db.json            # JSON database
```

## References
- `specs/ARCHITECTURE.md` - API details, data flow, error handling, ERD
- `specs/COMPONENTS.md` - Component structure, props, state management
- `docs/SRS_FINAL.md` - Full requirements specification
