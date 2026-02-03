# Phase 13 완료 보고서 - Common Components

## 생성된 파일 (13개)

### 공통 컴포넌트 (12개)
- [x] src/components/common/StatusBadge.tsx
- [x] src/components/common/LoadingSpinner.tsx
- [x] src/components/common/ErrorMessage.tsx
- [x] src/components/common/EmptyState.tsx
- [x] src/components/common/SearchInput.tsx
- [x] src/components/common/FormField.tsx
- [x] src/components/common/SelectField.tsx
- [x] src/components/common/DatePicker.tsx
- [x] src/components/common/TimePicker.tsx
- [x] src/components/common/Pagination.tsx
- [x] src/components/common/ConfirmDialog.tsx
- [x] src/components/common/DataTable.tsx

### 추가 파일 (1개)
- [x] src/components/common/index.ts (Barrel export)

## 빌드 결과
- npm run build: ✅ 성공 (12.0s)
- TypeScript 컴파일: ✅ 에러 없음

## 컴포넌트 상세

### 1. DataTable (복잡도: 높음)
**기능**:
- Generic 타입 지원: `<T extends { id: string }>`
- 컬럼 정의: key, label, sortable, render 함수
- 정렬 기능: 클릭 시 asc → desc → none
- 행 클릭 핸들러 (상세 페이지 이동)
- Empty state 통합
- 중첩 객체 값 접근 지원

**Props**:
```typescript
interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  sortable?: boolean;
}
```

**사용 예시**:
```tsx
<DataTable
  data={students}
  columns={[
    { key: 'name', label: '이름', sortable: true },
    {
      key: 'status',
      label: '상태',
      render: (student) => <StatusBadge status={student.status} />
    }
  ]}
  onRowClick={(student) => router.push(`/students/${student.id}`)}
/>
```

### 2. Pagination
**기능**:
- First, Previous, Page Numbers, Next, Last 버튼
- 최대 5개 페이지 번호 표시 (ellipsis 포함)
- 경계 페이지에서 버튼 비활성화
- 현재 페이지 하이라이트

**로직**:
- 총 페이지 ≤ 5: 모든 번호 표시
- 현재 페이지 ≤ 3: [1, 2, 3, 4, 5, ..., last]
- 현재 페이지 ≥ total-2: [1, ..., n-4, n-3, n-2, n-1, n]
- 중간: [1, ..., current-1, current, current+1, ..., last]

### 3. StatusBadge
**상태별 색상 매핑**:
- ✅ **Green (성공)**: active, paid, completed, present
- 🟡 **Yellow (대기)**: pending, waiting, partial
- 🔴 **Red (취소/미납)**: unpaid, overdue, dropped, withdrawn, cancelled, absent
- ⚪ **Gray (비활성)**: inactive, closed
- 🟠 **Orange (경고)**: late
- 🔵 **Blue (허가)**: excused

### 4. FormField
**구성**:
- Label (required indicator 포함)
- Children (input/select/etc.)
- Error message 표시
- 적절한 spacing

### 5. DatePicker
**기능**:
- react-day-picker 통합
- Popover UI
- 한글 로케일 지원 (ko locale)
- YYYY-MM-DD 포맷
- Calendar 컴포넌트 사용

### 6. TimePicker
**기능**:
- HH:mm 포맷 입력
- 실시간 유효성 검증
- 에러 메시지 표시
- Input 기반 (드롭다운 아님)

### 7. SelectField
**기능**:
- shadcn/ui Select 래퍼
- options 배열 지원: `{value, label}[]`
- placeholder 지원
- 간단한 API

### 8. SearchInput
**기능**:
- Search 아이콘 (왼쪽)
- Clear 버튼 (오른쪽, 값이 있을 때)
- onChange 핸들러
- placeholder 지원

### 9. LoadingSpinner
**기능**:
- 3가지 크기: sm (16px), md (24px), lg (32px)
- 회전 애니메이션
- Optional center alignment
- Loader2 아이콘 사용

### 10. EmptyState
**기능**:
- 커스터마이즈 가능한 아이콘 (기본: Inbox)
- 제목 + 설명
- Optional action 버튼
- 중앙 정렬 레이아웃

### 11. ErrorMessage
**기능**:
- AlertCircle 아이콘
- 에러 메시지 텍스트
- Optional retry 버튼
- 빨간색 테마

### 12. ConfirmDialog
**기능**:
- shadcn/ui AlertDialog 래퍼
- 커스터마이즈 title/description
- Confirm/Cancel 버튼
- destructive variant 지원

## 기술 스택

### Dependencies
- ✅ shadcn/ui (Table, Select, Popover, AlertDialog, etc.)
- ✅ lucide-react (Icons)
- ✅ react-day-picker (DatePicker)
- ✅ date-fns (Date formatting, locale)
- ✅ TypeScript (Generic types, strict mode)

### TypeScript
- ✅ Generic types (DataTable)
- ✅ Strict type safety
- ✅ Proper interface definitions
- ✅ No any types

### Code Quality
- ✅ Client components ('use client')
- ✅ Reusable components
- ✅ Consistent naming
- ✅ Korean language text
- ✅ Error handling
- ✅ Edge case handling

## Barrel Export

`src/components/common/index.ts`:
```typescript
export { DataTable } from './DataTable';
export { Pagination } from './Pagination';
export { ConfirmDialog } from './ConfirmDialog';
export { StatusBadge } from './StatusBadge';
export { SearchInput } from './SearchInput';
export { DatePicker } from './DatePicker';
export { TimePicker } from './TimePicker';
export { SelectField } from './SelectField';
export { FormField } from './FormField';
export { LoadingSpinner } from './LoadingSpinner';
export { EmptyState } from './EmptyState';
export { ErrorMessage } from './ErrorMessage';
```

**사용법**:
```tsx
import {
  DataTable,
  Pagination,
  StatusBadge,
  LoadingSpinner,
  EmptyState,
} from '@/components/common';
```

## 컴포넌트 조합 예시

### 리스트 페이지 패턴
```tsx
function StudentsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useQuery(['students', page]);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} onRetry={refetch} />;
  if (!data?.students.length) return <EmptyState title="수강생이 없습니다" />;

  return (
    <>
      <DataTable
        data={data.students}
        columns={columns}
        onRowClick={(student) => router.push(`/students/${student.id}`)}
      />
      <Pagination
        currentPage={page}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
      />
    </>
  );
}
```

### 폼 패턴
```tsx
function StudentForm() {
  return (
    <form>
      <FormField label="이름" required error={errors.name}>
        <Input {...register('name')} />
      </FormField>

      <FormField label="등급" required>
        <SelectField
          value={levelId}
          onChange={setLevelId}
          options={levels.map(l => ({ value: l.id, label: l.name }))}
        />
      </FormField>

      <FormField label="등록일" required>
        <DatePicker value={enrollDate} onChange={setEnrollDate} />
      </FormField>
    </form>
  );
}
```

### 삭제 확인 패턴
```tsx
function DeleteButton({ id, name }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>삭제</Button>
      <ConfirmDialog
        open={open}
        title="수강생 삭제"
        description={`${name} 수강생을 삭제하시겠습니까?`}
        onConfirm={async () => {
          await deleteStudent(id);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
```

## Acceptance Criteria 충족

- [x] npm run build succeeds
- [x] 모든 공통 컴포넌트 정상 동작
- [x] TypeScript 타입 안정성
- [x] shadcn/ui 패턴 준수
- [x] Generic 타입 지원 (DataTable)
- [x] 한글 지원
- [x] Edge case 처리
- [x] Barrel export 제공

## 주요 구현 결정

### 1. DataTable Generic
- 타입 안전성을 위해 Generic 타입 사용
- `{ id: string }` constraint로 최소 요구사항 정의
- Column render 함수로 유연성 확보

### 2. Pagination 로직
- 스마트 페이지 번호 표시 (최대 5개)
- ellipsis로 생략 표시
- 경계 케이스 처리

### 3. StatusBadge 매핑
- 모든 엔티티 상태 커버
- 일관된 색상 체계
- 직관적인 시각적 구분

### 4. 한글 지원
- date-fns/locale에서 ko import
- 모든 텍스트 한글
- placeholder 한글

## 발견된 이슈
- 없음 (빌드 성공, TypeScript 에러 없음)

## Phase 14 진행 가능
예

**다음 단계**: Settings Page 구현
- 학원 정보 폼
- 마스터 데이터 관리 (등급, 과목, 교실, 등록경로)
- 백업/복원 기능
- Common Components 활용
