# 개발 워크플로우 (Development Workflow) v2.0

> E2E 테스트 통합 버전

## 목적
신규 프로젝트를 100% 완성도로 개발하기 위한 전체 프로세스

## 적용 시점
- 새 프로젝트 시작
- Knack 50 데일리 챌린지
- 신규 MVP 개발

---

## 전체 흐름

```
[Phase 0: 환경 설정]
E2E 환경 구성 (최초 1회)

[Phase 1: 문서화]
SRS → Clarify #1 → Documents → CLAUDE.md → IMPLEMENTATION.md → Clarify #2

[Phase 2: 구현]
Backend Phase 1~N → npm run build
Frontend Phase 1~N → npm run build → E2E 테스트

[Phase 3: 검증 & 수정]
verify → plan → fix → 전체 E2E → 사용자 테스트 → 100%
```

---

## 프롬프트 파일 구조

```
_prompts/
├─ 0.env_settings.md           ← E2E 환경 포함
├─ 1.clarify.md
├─ 2.SRS_Final_generate.md
├─ 3.document_generate.md
├─ 4.claude_md_generate.md
├─ 5.IMPLEMENTATION_generate.md
├─ 6.IMPLEMENTATION_clarify.md
├─ 7.phase_backend.md          ← Backend Phase 템플릿
├─ 8.phase_frontend.md         ← Frontend Phase 템플릿 (E2E 포함)
└─ refactoring/
    ├─ 1.verify.md
    ├─ 2.plan.md
    ├─ 3.fix_phase.md
    └─ 4.final_e2e.md          ← 전체 E2E 검증
```

---

## Phase 0: 환경 설정 (최초 1회)

### 0.env_settings.md

```markdown
## 기본 환경

### 1. 프로젝트 초기화
npx create-next-app@latest [project-name]
cd [project-name]

### 2. 필수 패키지
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3

### 3. shadcn/ui
npx shadcn@latest init

---

## E2E 테스트 환경

### 1. Playwright MCP 설치 (Claude Code)

Claude Code 설정에서 MCP 활성화:
- playwright-test MCP 추가

또는 Claude Desktop:
- Settings → MCP → playwright-test 활성화

### 2. Playwright 패키지 설치

npm install -D @playwright/test
npx playwright install

### 3. playwright.config.ts 생성

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
  },
});

### 4. tests 폴더 생성

mkdir tests

### 5. 설치 확인

npx playwright test --version
```

---

## Phase 1: 문서화

### 1.clarify.md (Clarify #1 - 요구사항)

```markdown
[SRS 내용]

위 SRS를 검토하고 명확화 질문해줘.
- 모호한 요구사항
- 누락된 기능
- 기술적 제약사항
```

### 2.SRS_Final_generate.md

```markdown
Clarify #1 답변을 반영해서 최종 SRS 생성해줘.
specs/SRS.md로 저장.
```

### 3.document_generate.md

```markdown
SRS 기반으로 다음 문서 생성해줘:
- specs/REQUIREMENTS.md
- specs/ARCHITECTURE.md (Mermaid 다이어그램 포함)
- specs/DATABASE.md
```

### 4.claude_md_generate.md

```markdown
문서들 기반으로 CLAUDE.md 생성해줘.

## 규칙
- 60줄 제한 필수
- 핵심 컨텍스트만 포함
```

### 5.IMPLEMENTATION_generate.md

```markdown
문서들 기반으로 specs/IMPLEMENTATION.md 생성해줘.

## 구조

### Phase A: Backend (API + DB)
- Phase 1~N으로 구분
- 각 Phase별 체크리스트
- 완료 조건: npm run build 성공

### Phase B: Frontend (UI)
- Phase 1~N으로 구분
- 각 Phase별 체크리스트
- 완료 조건: npm run build 성공 + E2E 테스트 통과
```

### 6.IMPLEMENTATION_clarify.md (Clarify #2 - 기술검증)

```markdown
IMPLEMENTATION.md 검토해줘.

## 확인 사항
1. 구현 순서 적절한지
2. 누락된 파일 없는지
3. 의존성 순서 맞는지
4. 예상 이슈 있는지
5. Backend/Frontend 분리 적절한지

이게 유일한 검증 시점!
```

---

## Phase 2: 구현

### 7.phase_backend.md (Backend Phase 템플릿)

```markdown
IMPLEMENTATION.md의 Phase A-[N]을 구현해줘.

## 규칙
- Phase A-[N]의 항목들 순서대로 진행
- 완료 후 npm run build
- 에러 발생 시 즉시 수정
- 완료된 항목 ✅ 표시

## 완료 조건
- [ ] 모든 항목 구현
- [ ] npm run build 성공
```

### 8.phase_frontend.md (Frontend Phase 템플릿)

```markdown
IMPLEMENTATION.md의 Phase B-[N]을 구현해줘.

## 규칙
- Phase B-[N]의 항목들 순서대로 진행
- 완료 후 npm run build
- 에러 발생 시 즉시 수정
- 완료된 항목 ✅ 표시

## 완료 조건
- [ ] 모든 항목 구현
- [ ] npm run build 성공
- [ ] E2E 테스트 통과

## E2E 테스트
구현 완료 후 playwright-test MCP로 해당 기능 E2E 테스트 실행.

예시:
"[기능명] E2E 테스트해줘. 
주요 시나리오: CRUD, 유효성검증, 에러처리"

테스트 통과해야 다음 Phase 진행.
```

---

## Phase 3: 검증 & 수정

### refactoring/1.verify.md

```markdown
IMPLEMENTATION.md와 실제 코드를 비교 분석해줘.

## 분석 내용
1. 완료된 기능 (실제 동작 확인됨)
2. TODO 항목 (파일명:라인번호 포함)
3. 우선순위 분류
   - P1: MVP 차단 (필수)
   - P2: 핵심 기능 (권장)
   - P3: 개선 사항 (선택)
4. 완성도 %
5. 권장 사항

## 출력
docs/YYYYMMDD_REPORT.md 파일로 생성해줘.

코드는 수정하지 마.
```

### refactoring/2.plan.md

```markdown
docs/YYYYMMDD_REPORT.md 기반으로 
IMPLEMENTATION.md에 새 Phase 추가해줘.

## Phase C-1: P1 Fixes (MVP 차단)
- [ ] P1 항목들 (리포트에서 가져오기)

## Phase C-2: P2 Fixes (핵심 기능)  
- [ ] P2 항목들 (리포트에서 가져오기)

기존 Phase는 유지.
```

### refactoring/3.fix_phase.md

```markdown
IMPLEMENTATION.md의 Phase C (P1/P2 Fixes) 항목들을 순서대로 구현해줘.

## 규칙
- Phase C의 항목들 순서대로 진행
- 각 항목 구현 후 테스트
- 전체 완료 후 npm run build
- 빌드 성공하면 완료된 항목 ✅ 표시
- 에러 발생 시 즉시 수정
```

### refactoring/4.final_e2e.md

```markdown
전체 E2E 테스트 실행해줘.

## 범위
playwright-test MCP로 모든 프론트엔드 기능 테스트:
- 각 페이지 접근 및 렌더링
- CRUD 기능 전체
- 필터/검색 기능
- 유효성 검증
- 에러 처리

## 통합 시나리오 (예시)
1. 사용자 가입 → 로그인 → 메인 기능 사용 → 로그아웃
2. 데이터 생성 → 수정 → 삭제 → 목록 확인
3. 에러 상황 → 에러 메시지 → 복구

## 실패 시
- 실패 테스트 목록 정리
- 원인 분석
- 수정 후 재실행
- 모든 테스트 통과할 때까지 반복

## 완료 조건
- [ ] 전체 E2E 테스트 통과
- [ ] 실패 테스트 0개
```

---

## 흐름도

```
┌─────────────────────────────────────────────────┐
│              전체 개발 워크플로우                  │
└─────────────────────────────────────────────────┘

═══════════════════════════════════════════════════
              Phase 0: 환경 설정 (최초 1회)
═══════════════════════════════════════════════════

0.env_settings.md
    │
    ▼
┌─────────────────┐
│ 기본 환경 설정   │
│ - Next.js       │
│ - Drizzle       │
│ - shadcn/ui     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ E2E 환경 설정   │
│ - Playwright    │
│   MCP 활성화    │
│ - 패키지 설치   │
│ - config 생성   │
└─────────────────┘

═══════════════════════════════════════════════════
                 Phase 1: 문서화
═══════════════════════════════════════════════════

SRS (초안)
    │
    ▼
1.clarify.md (Clarify #1)
    │
    ▼
┌─────────────────┐
│ 요구사항 명확화  │ ← 모호한 부분 질문
└─────────────────┘
    │
    ▼
2.SRS_Final_generate.md
    │
    ▼
┌─────────────────┐
│ specs/SRS.md    │ ← 최종 SRS
└─────────────────┘
    │
    ▼
3.document_generate.md
    │
    ▼
┌─────────────────┐
│ REQUIREMENTS.md │
│ ARCHITECTURE.md │ ← Mermaid 다이어그램
│ DATABASE.md     │
└─────────────────┘
    │
    ▼
4.claude_md_generate.md
    │
    ▼
┌─────────────────┐
│ CLAUDE.md       │ ← 60줄 제한!
└─────────────────┘
    │
    ▼
5.IMPLEMENTATION_generate.md
    │
    ▼
┌─────────────────┐
│ IMPLEMENTATION  │ ← Phase A (Backend)
│ .md             │   Phase B (Frontend)
└─────────────────┘
    │
    ▼
6.IMPLEMENTATION_clarify.md (Clarify #2)
    │
    ▼
┌─────────────────┐
│ 기술 검증       │ ← 유일한 검증 시점!
│ (Claude.ai)    │
└─────────────────┘

═══════════════════════════════════════════════════
                 Phase 2: 구현
═══════════════════════════════════════════════════

┌─────────────────────────────────────────────────┐
│  Phase A: Backend (API + DB)                    │
└─────────────────────────────────────────────────┘

7.phase_backend.md (Phase A-1)
    │
    ▼
┌─────────────────┐
│ Backend 구현    │ → npm run build ✓
│ (API Routes)   │
└─────────────────┘
    │
    ▼
7.phase_backend.md (Phase A-2 ~ A-N)
    │
    ▼
┌─────────────────┐
│ Backend 완료    │ → npm run build ✓
│ (DB + API)     │   E2E 없음 (Frontend에서 검증)
└─────────────────┘

┌─────────────────────────────────────────────────┐
│  Phase B: Frontend (UI)                         │
└─────────────────────────────────────────────────┘

8.phase_frontend.md (Phase B-1)
    │
    ▼
┌─────────────────┐
│ Frontend 구현   │ → npm run build ✓
│ (Page 1)       │ → E2E 테스트 ✓
└─────────────────┘
    │
    ▼
8.phase_frontend.md (Phase B-2)
    │
    ▼
┌─────────────────┐
│ Frontend 구현   │ → npm run build ✓
│ (Page 2)       │ → E2E 테스트 ✓
└─────────────────┘
    │
    ▼
    ... (반복)
    │
    ▼
8.phase_frontend.md (Phase B-N)
    │
    ▼
┌─────────────────┐
│ Frontend 완료   │ → npm run build ✓
│ (모든 Page)    │ → E2E 테스트 ✓
└─────────────────┘

═══════════════════════════════════════════════════
              Phase 3: 검증 & 수정
═══════════════════════════════════════════════════

refactoring/1.verify.md
    │
    ▼
┌─────────────────┐
│ 리포트 생성      │ → docs/YYYYMMDD_REPORT.md
│ (P1/P2/P3 식별) │
└─────────────────┘
    │
    ▼
refactoring/2.plan.md
    │
    ▼
┌─────────────────┐
│ Phase 추가      │ → IMPLEMENTATION.md
│ (P1→Phase C-1) │
│ (P2→Phase C-2) │
└─────────────────┘
    │
    ▼
refactoring/3.fix_phase.md
    │
    ▼
┌─────────────────┐
│ P1/P2 수정      │ → npm run build ✓
└─────────────────┘
    │
    ▼
refactoring/4.final_e2e.md
    │
    ▼
┌─────────────────┐
│ 전체 E2E 실행   │
│ - 모든 기능     │
│ - 통합 시나리오 │
└─────────────────┘
    │
    ├─── 실패 → 수정 → 재실행
    │
    ▼
┌─────────────────┐
│ 사용자 테스트    │ ← 직접 앱 동작 확인
└─────────────────┘
    │
    ├─── 문제 발견 → 1.verify.md (반복)
    │
    └─── 문제 없음 → 완료! ✅ 100%
```

---

## IMPLEMENTATION.md 템플릿

```markdown
# Implementation Plan

## Phase A: Backend (API + DB)

### Phase A-1: Database Schema
- [ ] lib/db/schema.ts
- [ ] lib/db/index.ts
- [ ] npm run build 성공

### Phase A-2: API Routes
- [ ] app/api/[resource]/route.ts
- [ ] npm run build 성공

---

## Phase B: Frontend (UI)

### Phase B-1: [페이지명] UI
- [ ] app/[page]/page.tsx
- [ ] components/[component].tsx
- [ ] npm run build 성공
- [ ] E2E 테스트 통과

### Phase B-2: [페이지명] UI
- [ ] app/[page]/page.tsx
- [ ] components/[component].tsx
- [ ] npm run build 성공
- [ ] E2E 테스트 통과

---

## Phase C: Fixes (필요시 추가)

### Phase C-1: P1 Fixes
- [ ] [P1 항목들]

### Phase C-2: P2 Fixes
- [ ] [P2 항목들]
```

---

## 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Clarify #2가 품질 결정** | "어짜피 여기서 품질 판가름난다" |
| **구현 중 Clarify 금지** | 컨텍스트 드리프트 & 재작업 방지 |
| **Context Clear 후 Plan 금지** | 과도 설계 방지 |
| **CLAUDE.md 60줄 제한** | 임시파일 폭발 방지 |
| **Phase별 빌드 검증** | React 문법오류 조기 발견 |
| **Frontend E2E 필수** | Phase별 E2E 통과해야 다음 진행 |
| **Backend E2E 불필요** | Frontend E2E에서 간접 검증됨 |
| **Living Document** | IMPLEMENTATION.md 계속 업데이트 |

---

## 체크리스트

### Phase 0 완료 조건 (최초 1회)
- [ ] Next.js 프로젝트 생성
- [ ] Drizzle + SQLite 설정
- [ ] shadcn/ui 초기화
- [ ] Playwright MCP 활성화
- [ ] Playwright 패키지 설치
- [ ] playwright.config.ts 생성
- [ ] tests 폴더 생성

### Phase 1 완료 조건
- [ ] SRS.md 생성됨
- [ ] REQUIREMENTS.md 생성됨
- [ ] ARCHITECTURE.md 생성됨 (Mermaid 포함)
- [ ] DATABASE.md 생성됨
- [ ] CLAUDE.md 생성됨 (60줄 이하)
- [ ] IMPLEMENTATION.md 생성됨 (Phase A/B 분리)
- [ ] Clarify #2 완료 (Claude.ai 검증)

### Phase 2 완료 조건
- [ ] Phase A (Backend) 구현 완료
- [ ] 각 Backend Phase 후 npm run build 성공
- [ ] Phase B (Frontend) 구현 완료
- [ ] 각 Frontend Phase 후 npm run build 성공
- [ ] 각 Frontend Phase 후 E2E 테스트 통과
- [ ] IMPLEMENTATION.md 체크박스 업데이트

### Phase 3 완료 조건
- [ ] verify 리포트 생성됨
- [ ] P1 항목 0개 (또는 모두 수정)
- [ ] P2 항목 모두 수정 (권장)
- [ ] 전체 E2E 테스트 통과
- [ ] 사용자 테스트 통과
- [ ] 완성도 95%+ 달성

---

## E2E 테스트 프롬프트 예시

### Phase별 E2E (구현 직후)

```
[기능명] E2E 테스트해줘.

URL: http://localhost:3000/[page]

시나리오:
- 목록 조회
- 신규 생성
- 수정
- 삭제
- 필터/검색
- 유효성 검증
- 에러 처리

통과할 때까지 수정하고 재실행.
```

### 전체 E2E (최종 검증)

```
전체 E2E 테스트 실행해줘.

모든 페이지와 기능 테스트:
- [페이지 1]: CRUD + 필터
- [페이지 2]: CRUD + 필터
- ...

통합 시나리오:
1. [시나리오 1]
2. [시나리오 2]

실패한 테스트 수정하고 전체 통과 확인.
```

---

## 예상 소요 시간

| Phase | 소요 시간 | 비고 |
|-------|----------|------|
| Phase 0 | 30분 | 최초 1회 |
| Phase 1 | 1~2시간 | 문서화 + Clarify |
| Phase 2 (Backend) | 1~2시간 | API + DB |
| Phase 2 (Frontend) | 2~4시간 | UI + E2E |
| Phase 3 | 1~2시간 | P1/P2 + 전체 E2E |
| **합계** | **5~10시간** | Level 3~4 기준 |

---

## 참고

- **Day 6부터 적용:** 9단계 문서 기반 워크플로우
- **Day 9 E2E 추가:** Playwright MCP 통합
- **BP 근거:** Anthropic - "Claude performs dramatically better when it can verify its own work"
- **Level 2.5 문서 전략:** 파일명 + 함수 시그니처 + 핵심 로직 패턴

---

**버전:** 2.0  
**생성일:** 2026-02-04  
**변경사항:** E2E 테스트 워크플로우 통합