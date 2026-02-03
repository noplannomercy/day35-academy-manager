# Phase 14 완료 보고서 - Settings Page

## 생성된 파일 (8개)

### Settings 컴포넌트
- [x] src/app/(routes)/settings/page.tsx (Main page with tabs)
- [x] src/components/settings/AcademyInfoForm.tsx
- [x] src/components/settings/LevelManager.tsx
- [x] src/components/settings/SubjectManager.tsx
- [x] src/components/settings/RoomManager.tsx
- [x] src/components/settings/SourceManager.tsx
- [x] src/components/settings/BackupSection.tsx
- [x] src/components/settings/MasterDataList.tsx

## 빌드 결과
- npm run build: ✅ 성공 (18.2s)
- TypeScript 컴파일: ✅ 에러 없음

## 페이지 구조

### Settings Page (3개 탭)
```
┌─────────────────────────────────────┐
│ [학원 정보] [마스터 데이터] [백업/복원] │
├─────────────────────────────────────┤
│                                     │
│  Tab Content                        │
│                                     │
└─────────────────────────────────────┘
```

## 구현 내용

### 1. Settings Page (Main)
**기능**:
- 3개 탭 레이아웃 (shadcn/ui Tabs)
- GET /api/settings로 초기 데이터 로드
- LoadingSpinner 표시
- ErrorMessage 표시
- 각 탭에 해당 컴포넌트 렌더링

**구조**:
```tsx
<Tabs defaultValue="info">
  <TabsList>
    <TabsTrigger value="info">학원 정보</TabsTrigger>
    <TabsTrigger value="master">마스터 데이터</TabsTrigger>
    <TabsTrigger value="backup">백업/복원</TabsTrigger>
  </TabsList>

  <TabsContent value="info">
    <AcademyInfoForm />
  </TabsContent>

  <TabsContent value="master">
    <LevelManager />
    <SubjectManager />
    <RoomManager />
    <SourceManager />
  </TabsContent>

  <TabsContent value="backup">
    <BackupSection />
  </TabsContent>
</Tabs>
```

### 2. AcademyInfoForm
**필드**:
- academyName (학원명) - required
- phone (전화번호) - required
- address (주소) - optional
- operatingHours.start (운영 시작 시간) - required, TimePicker
- operatingHours.end (운영 종료 시간) - required, TimePicker

**기능**:
- react-hook-form + zod validation
- PUT /api/settings로 업데이트
- Toast 알림 (성공/실패)
- FormField 컴포넌트 사용
- TimePicker 컴포넌트 사용

**Validation**:
```typescript
const schema = z.object({
  academyName: z.string().min(1, "학원명을 입력하세요"),
  phone: z.string().min(1, "전화번호를 입력하세요"),
  address: z.string().optional(),
  operatingHours: z.object({
    start: z.string().regex(/^\d{2}:\d{2}$/),
    end: z.string().regex(/^\d{2}:\d{2}$/),
  }),
});
```

### 3. Master Data Managers (4개)

#### 공통 패턴
- MasterDataList 컴포넌트로 목록 표시
- "추가" 버튼 → Dialog 열기
- 각 항목에 Edit/Delete 버튼
- Dialog에서 Form 입력
- ConfirmDialog로 삭제 확인
- PUT /api/settings로 전체 settings 업데이트

#### LevelManager (등급 관리)
**필드**:
- name (등급명) - required
- order (순서) - required, number

**특징**:
- order 필드로 정렬
- 초급 < 중급 < 고급 순서 관리

#### SubjectManager (과목 관리)
**필드**:
- name (과목명) - required

**예시**: 영어, 수학, 국어

#### RoomManager (교실 관리)
**필드**:
- name (교실명) - required

**예시**: 101호, 102호

#### SourceManager (등록경로 관리)
**필드**:
- name (경로명) - required

**예시**: 지인소개, 온라인광고

### 4. MasterDataList (재사용 컴포넌트)
**Props**:
```typescript
interface MasterDataListProps {
  items: Array<{ id: string; name: string; order?: number }>;
  onEdit: (item) => void;
  onDelete: (id: string) => void;
  showOrder?: boolean;
}
```

**기능**:
- 항목 목록 표시
- order 필드 표시 (showOrder=true)
- Edit 버튼 (Pencil icon)
- Delete 버튼 (Trash2 icon)
- Empty state 메시지

### 5. BackupSection

#### Backup (백업 다운로드)
**기능**:
- "백업 다운로드" 버튼
- GET /api/backup 호출
- JSON 파일 생성: backup-YYYYMMDD-HHmmss.json
- date-fns로 timestamp 생성
- Blob + URL.createObjectURL로 다운로드
- Toast 알림

**파일명 예시**: `backup-20260202-143022.json`

#### Restore (복원)
**기능**:
- File input (accept=".json")
- 파일 선택 시 JSON parsing
- ConfirmDialog로 확인
- POST /api/backup으로 복원
- 복원 통계 표시 (students, instructors, classes 수)
- 성공 시 페이지 새로고침 (window.location.reload)
- Toast 알림

**복원 확인 메시지**:
```
데이터를 복원하시겠습니까?

현재 데이터가 모두 삭제되고
백업 데이터로 대체됩니다.
```

## API 통합

### GET /api/settings
- 학원 정보 + 마스터 데이터 조회
- Response:
```json
{
  "data": {
    "academyName": "테스트학원",
    "phone": "02-1234-5678",
    "address": "",
    "operatingHours": { "start": "09:00", "end": "22:00" },
    "levels": [...],
    "subjects": [...],
    "rooms": [...],
    "sources": [...]
  }
}
```

### PUT /api/settings
- 전체 settings 업데이트
- 학원 정보 또는 마스터 데이터 변경 시 호출
- Request body: 전체 Settings 객체

### GET /api/backup
- 전체 데이터베이스 JSON 반환
- Response:
```json
{
  "version": "1.0",
  "exportedAt": "2026-02-02T...",
  "data": {
    "students": [...],
    "instructors": [...],
    ...
  }
}
```

### POST /api/backup
- 백업 데이터로 데이터베이스 복원
- Request body: Backup JSON
- Response: 복원 통계
```json
{
  "message": "데이터가 복원되었습니다.",
  "stats": {
    "students": 10,
    "instructors": 5,
    "classes": 8,
    ...
  }
}
```

## 사용된 Common Components

- ✅ FormField (label + error)
- ✅ Input (text input)
- ✅ TimePicker (operating hours)
- ✅ LoadingSpinner (loading state)
- ✅ ErrorMessage (error state)
- ✅ ConfirmDialog (delete/restore confirmation)

## 사용된 shadcn/ui Components

- ✅ Tabs, TabsList, TabsTrigger, TabsContent
- ✅ Card, CardHeader, CardTitle, CardContent
- ✅ Dialog, DialogContent, DialogHeader, DialogTitle
- ✅ Button
- ✅ Input
- ✅ Label

## 기술 스택

### Form Management
- ✅ react-hook-form (useForm)
- ✅ @hookform/resolvers/zod
- ✅ zod (validation schemas)

### Notifications
- ✅ sonner (toast)

### Utilities
- ✅ date-fns (format timestamp)
- ✅ crypto.randomUUID() (ID generation)

### TypeScript
- ✅ Strict type safety
- ✅ Type imports from @/types
- ✅ Interface definitions

## 사용자 플로우

### 학원 정보 수정
1. /settings 페이지 접속
2. "학원 정보" 탭 (기본)
3. 정보 수정
4. "저장" 버튼 클릭
5. Toast 알림 표시
6. 데이터 새로고침

### 등급 추가
1. "마스터 데이터" 탭 클릭
2. 등급 관리 섹션의 "추가" 버튼
3. Dialog 열림
4. 등급명, 순서 입력
5. "저장" 클릭
6. PUT /api/settings 호출
7. 목록에 추가됨

### 백업/복원
1. "백업/복원" 탭 클릭
2. **백업**: "백업 다운로드" 클릭 → JSON 파일 다운로드
3. **복원**: 파일 선택 → 확인 Dialog → 복원 실행 → 페이지 새로고침

## Acceptance Criteria 충족

- [x] npm run build succeeds
- [x] 설정 저장/조회 정상
- [x] 마스터 데이터 관리 정상 (CRUD)
- [x] 백업/복원 정상
- [x] TypeScript 타입 안정성
- [x] 한글 지원
- [x] Toast 알림
- [x] 확인 Dialog (삭제/복원)

## 주요 구현 결정

### 1. 전체 Settings 업데이트
- 마스터 데이터 변경 시 전체 settings 객체를 PUT
- 이유: API 설계가 전체 업데이트 방식
- 장점: 간단한 API, 원자적 업데이트
- 단점: 불필요한 데이터 전송 (작은 JSON이므로 무시 가능)

### 2. ID 생성
- crypto.randomUUID() 사용
- 브라우저 표준 API
- 고유성 보장

### 3. 복원 후 새로고침
- window.location.reload() 호출
- 이유: 모든 상태 초기화 필요
- 복원 후 전체 앱 데이터 재로드

### 4. MasterDataList 재사용
- 4개 Manager가 동일한 UI 패턴
- 재사용 컴포넌트로 중복 제거
- order 필드는 optional로 처리

## 발견된 이슈
- 없음 (빌드 성공, TypeScript 에러 없음)

## Phase 15 진행 가능
예

**다음 단계**: Instructor Pages + Salary Management
- 강사 목록/등록/수정 페이지
- 급여 목록/등록/지급 페이지
- InstructorSelect 컴포넌트 (반 생성 시 사용)
