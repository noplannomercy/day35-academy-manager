# 수납(Payment) E2E 테스트 보고서

**테스트 일시**: 2026-02-03
**테스트 대상**: Payment 기능 전체 플로우
**테스트 방법**: API Level E2E Testing

---

## 📊 테스트 결과 요약

| 구분 | 총 테스트 | 성공 | 실패 | 버그 발견 |
|------|-----------|------|------|-----------|
| 목록/필터 | 4 | 4 | 0 | 0 |
| 수납 등록 | 3 | 3 | 0 | 0 |
| 납부 처리 | 2 | 2 | 0 | 0 |
| 환불 처리 | 2 | 1 | 1 | 2 |
| 에러 케이스 | 2 | 2 | 0 | 0 |
| **합계** | **13** | **12** | **1** | **2** |

**전체 성공률**: 92.3% (12/13)
**Critical Bug 발견**: 2개

---

## ✅ 성공한 테스트 (12개)

### 시나리오 1: 목록 조회 및 필터 (4/4 성공)

#### Test 1: 전체 수납 목록 조회 ✅
```bash
GET /api/payments
```
**결과**: 성공
- 총 2개 수납 반환
- pagination: {page: 1, limit: 10, total: 2}
- summary: {totalAmount: 400000, paidAmount: 400000, unpaidAmount: 0}
- 학생/반 정보 정상 포함

#### Test 2: 월별 필터 (2026-02) ✅
```bash
GET /api/payments?month=2026-02
```
**결과**: 성공 (total: 2)

#### Test 3: 상태별 필터 (paid) ✅
```bash
GET /api/payments?status=paid
```
**결과**: 성공 (total: 2)

#### Test 4: 상태별 필터 (unpaid) ✅
```bash
GET /api/payments?status=unpaid
```
**결과**: 성공 (total: 0)

---

### 시나리오 2: 수납 등록 (3/3 성공)

#### Test 5: 수납 등록 (일반) ✅
```bash
POST /api/payments
{
  "studentId": "a2e695df-92da-48a1-800e-13ae70ffe604",
  "classId": "ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5",
  "month": "2026-03",
  "amount": 300000,
  "isProrated": false
}
```
**결과**: 성공
- Payment ID: 299978c2-e10f-4d14-878d-ec7ddd29e380
- status: "unpaid"
- paidAmount: 0
- message: "수납이 등록되었습니다."

#### Test 6: 일할계산 금액 조회 ✅
```bash
POST /api/payments/calculate-prorated
{
  "classId": "ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5",
  "enrollDate": "2026-03-15",
  "month": "2026-03"
}
```
**결과**: 성공
```json
{
  "originalAmount": 300000,
  "proratedAmount": 180000,
  "totalClassDays": 5,
  "remainingDays": 3,
  "calculationDetails": "2026-03 총 수업일 5일 중 3일 수강 (2026-03-15 등록)"
}
```

#### Test 7: 수납 등록 (일할계산) ✅
```bash
POST /api/payments
{
  "studentId": "010f4177-36fd-483e-91b2-4a654271f6a3",
  "classId": "ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5",
  "month": "2026-04",
  "amount": 180000,
  "isProrated": true
}
```
**결과**: 성공
- Payment ID: bc4bffdc-d442-4556-bdb3-43021a7dcacb
- amount: 180000 (일할계산 적용)
- isProrated: true

---

### 시나리오 3: 납부 처리 (2/2 성공)

#### Test 8: 납부 처리 (전액) ✅
```bash
PATCH /api/payments/299978c2-e10f-4d14-878d-ec7ddd29e380/pay
{
  "paymentType": "full",
  "method": "card"
}
```
**결과**: 성공
- paidAmount: 300000 (100%)
- status: "paid"
- paidDate: "2026-02-03"
- method: "card"

#### Test 9: 납부 처리 (반액) ✅
```bash
PATCH /api/payments/bc4bffdc-d442-4556-bdb3-43021a7dcacb/pay
{
  "paymentType": "half",
  "method": "cash"
}
```
**결과**: 성공
- amount: 180000
- paidAmount: 90000 (50%)
- status: "partial"
- method: "cash"

---

### 시나리오 4: 환불 처리 (1/2 성공)

#### Test 10: 환불 처리 (정상) ✅
```bash
POST /api/refunds
{
  "paymentId": "299978c2-e10f-4d14-878d-ec7ddd29e380",
  "amount": 50000,
  "reason": "부분 환불 요청",
  "refundMethod": "card"
}
```
**결과**: 성공
- Refund ID: aa5c9060-842f-4080-9226-ac471ac36f7c
- amount: 50000
- refundDate: "2026-02-03"
- message: "환불이 처리되었습니다."

#### Test 11: 환불 금액 초과 ❌ **버그 발견!**
```bash
POST /api/refunds
{
  "paymentId": "299978c2-e10f-4d14-878d-ec7ddd29e380",
  "amount": 260000,
  "reason": "환불 초과 테스트"
}
```
**기대 결과**: 에러 (환불 금액 초과)
**실제 결과**: ❌ **성공 (버그!)**

**버그 상세**:
- Payment paidAmount: 300,000원
- 첫 번째 환불: 50,000원 (Test 10)
- 두 번째 환불: 260,000원 (Test 11)
- **총 환불액: 310,000원** (납부액 초과!)

**원인 분석**:
```typescript
// src/app/api/refunds/route.ts:117-123
if (data.amount > payment.paidAmount) {
  return errorResponse('환불 금액이 납부 금액을 초과합니다.');
}
```
- 코드가 **개별 환불 금액**만 paidAmount와 비교
- **기존 환불 내역의 합계를 고려하지 않음**
- 올바른 로직: `(기존 환불 총액 + 신규 환불 금액) > paidAmount` 검증 필요

---

### 시나리오 5: 에러 케이스 (2/2 성공)

#### Test 12: 중복 수납 등록 차단 ✅
```bash
POST /api/payments
{
  "studentId": "a2e695df-92da-48a1-800e-13ae70ffe604",
  "classId": "ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5",
  "month": "2026-03",
  "amount": 300000
}
```
**결과**: 성공 (차단됨)
```json
{
  "error": "이미 해당 월의 수납 건이 존재합니다.",
  "code": "DUPLICATE_PAYMENT"
}
```

#### Test 13: 수납 등록 (추가 검증) ✅
```bash
POST /api/payments
{
  "studentId": "010f4177-36fd-483e-91b2-4a654271f6a3",
  "classId": "8a2e75e3-db34-44b1-bb7e-a1c8f6b42b0f",
  "month": "2026-05",
  "amount": 200000
}
```
**결과**: 성공
- Payment ID: 180ab301-3fde-44c0-97cf-b107ddc6d5aa

---

## 🐛 발견된 버그 상세

### Bug #1: 환불 금액 검증 로직 오류 (CRITICAL)

**심각도**: ⚠️ **CRITICAL**
**위치**: `src/app/api/refunds/route.ts` Line 117-123
**타입**: 비즈니스 로직 오류

**문제**:
환불 생성 시 **기존 환불 내역을 고려하지 않고** 개별 환불 금액만 납부 금액과 비교하여, 총 환불액이 납부액을 초과하는 경우를 차단하지 못함.

**재현 방법**:
1. Payment 생성 (amount: 300,000원)
2. 전액 납부 처리 (paidAmount: 300,000원)
3. 첫 번째 환불 (50,000원) - 성공
4. 두 번째 환불 (260,000원) - **성공 (버그!)**
5. 총 환불액: 310,000원 > 납부액: 300,000원

**영향**:
- 실제 납부액보다 많은 금액을 환불할 수 있음
- 재무 데이터 무결성 손상
- 실제 운영 시 금전적 손실 가능

**수정 방안**:
```typescript
// 기존 코드 (잘못됨)
if (data.amount > payment.paidAmount) {
  return errorResponse('환불 금액이 납부 금액을 초과합니다.');
}

// 수정된 코드
const existingRefunds = db.refunds.filter(r => r.paymentId === data.paymentId);
const totalRefunded = existingRefunds.reduce((sum, r) => sum + r.amount, 0);
const remainingAmount = payment.paidAmount - totalRefunded;

if (data.amount > remainingAmount) {
  return errorResponse(
    `환불 가능 금액은 ${remainingAmount.toLocaleString()}원입니다. (납부: ${payment.paidAmount.toLocaleString()}원, 기환불: ${totalRefunded.toLocaleString()}원)`,
    'REFUND_AMOUNT_EXCEEDS',
    400
  );
}
```

---

### Bug #2: 환불 목록 조회 API 오류

**심각도**: ⚠️ **HIGH**
**위치**: `GET /api/refunds`
**타입**: 데이터 스키마 불일치

**문제**:
환불 목록 조회 시 `INTERNAL_ERROR` 발생

**증상**:
```bash
GET /api/refunds
→ {"error":"환불 목록 조회에 실패했습니다.","code":"INTERNAL_ERROR"}
```

**원인 분석**:
`data/db.json`의 첫 번째 환불 레코드가 구버전 스키마 사용:
```json
{
  "id": "950b2e70-ad78-4f7a-b7d3-d15cfc2425e8",
  "refundMethod": "card",     // ❌ Refund interface에 없는 필드
  "processedAt": "2026-02-02T08:40:00.000Z"  // ❌ refundDate가 아님
}
```

**Refund Interface** (src/types/index.ts:190-197):
```typescript
export interface Refund {
  id: string;
  paymentId: string;
  amount: number;
  reason: string;
  refundDate: string;  // ✅ 올바른 필드명
  createdAt: string;
}
```

**수정 방안**:
`data/db.json`의 첫 번째 환불 레코드를 올바른 스키마로 마이그레이션:
```json
{
  "id": "950b2e70-ad78-4f7a-b7d3-d15cfc2425e8",
  "paymentId": "203587ac-8305-4277-8354-73381a5925e3",
  "amount": 50000,
  "reason": "부분 환불 테스트",
  "refundDate": "2026-02-02",
  "createdAt": "2026-02-02T08:39:30.123Z"
}
```

---

## 📈 테스트 커버리지

### API 엔드포인트 테스트 커버리지

| API | Method | 테스트 | 상태 |
|-----|--------|--------|------|
| /api/payments | GET | ✅ | 성공 |
| /api/payments | POST | ✅ | 성공 |
| /api/payments?month= | GET | ✅ | 성공 |
| /api/payments?status= | GET | ✅ | 성공 |
| /api/payments/calculate-prorated | POST | ✅ | 성공 |
| /api/payments/[id]/pay | PATCH | ✅ | 성공 |
| /api/refunds | GET | ❌ | **버그** |
| /api/refunds | POST | ⚠️ | **버그 있음** |

**커버리지**: 8/8 엔드포인트 (100%)
**정상 작동**: 6/8 엔드포인트 (75%)

### 비즈니스 규칙 검증

| 규칙 | 테스트 | 상태 |
|------|--------|------|
| 중복 수납 차단 (same student + class + month) | ✅ | 통과 |
| 일할계산 정확성 | ✅ | 통과 |
| 전액 납부 (100%) | ✅ | 통과 |
| 반액 납부 (50%) | ✅ | 통과 |
| 환불 금액 초과 차단 | ❌ | **실패 (버그)** |
| Inactive 학생 수납 차단 | - | 미테스트 |

**커버리지**: 5/6 규칙 (83.3%)
**정상 작동**: 4/5 규칙 (80%)

---

## 🔍 추가 발견 사항

### 1. 데이터 정합성 이슈

**문제**: 존재하지 않는 학생 ID 참조
- Payment ID `pay-002`가 `studentId: ac9fd4c3-0c9d-4315-95a0-4fd104dfd0aa`를 참조
- 해당 학생이 students 배열에 없음
- API 응답에서 `student: null`로 반환됨

**영향**: 경미 (API는 작동하지만 UI에서 학생 이름 표시 불가)

### 2. 한글 인코딩 이슈

**문제**: notes 필드의 한글이 깨져서 저장됨
```json
"notes": "2026-03-15 ���, ���Ұ�� ����"
```

**영향**: 경미 (기능상 문제 없으나 가독성 저하)

---

## 🎯 권장 사항

### 즉시 수정 필요 (CRITICAL)

1. **환불 금액 검증 로직 수정** (Bug #1)
   - 기존 환불 내역 합계 고려하도록 수정
   - 테스트 케이스 추가

2. **환불 목록 조회 API 수정** (Bug #2)
   - 첫 번째 환불 레코드 스키마 마이그레이션
   - Refund interface와 일치시키기

### 단기 개선 (HIGH)

3. **데이터 정합성 검증**
   - 존재하지 않는 학생 ID 참조 레코드 정리
   - Foreign Key 검증 로직 추가

4. **Inactive 학생 수납 차단 테스트**
   - 누락된 테스트 케이스 추가
   - 비즈니스 규칙 검증 완료

### 장기 개선 (MEDIUM)

5. **한글 인코딩 문제 해결**
   - UTF-8 인코딩 명시적 설정
   - 데이터 저장 시 인코딩 검증

6. **E2E 테스트 자동화**
   - Playwright 테스트 스크립트 작성
   - CI/CD 파이프라인 통합

---

## 📝 테스트 데이터 변경 사항

### 테스트 전 (2개)
- Payment ID: 203587ac... (paid, 200,000원)
- Payment ID: pay-002 (paid, 200,000원)

### 테스트 후 (5개)
- Payment ID: 203587ac... (paid, 200,000원) - 기존
- Payment ID: pay-002 (paid, 200,000원) - 기존
- Payment ID: 299978c2... (paid, 300,000원) - **신규 (Test 5 → Test 8)**
- Payment ID: bc4bffdc... (partial, 180,000원, 90,000원 납부) - **신규 (Test 7 → Test 9)**
- Payment ID: 180ab301... (unpaid, 200,000원) - **신규 (Test 13)**

### 환불 (3개)
- Refund ID: 950b2e70... (50,000원) - 기존
- Refund ID: aa5c9060... (50,000원) - **신규 (Test 10)**
- Refund ID: 910c2408... (260,000원) - **신규 (Test 11, 버그로 생성됨)**

---

## ✅ 결론

### 전체 평가

**수납(Payment) 기능은 대부분 정상 작동하지만, 2개의 Critical/High 버그가 발견되었습니다.**

- ✅ **핵심 기능 정상**: 수납 등록, 일할계산, 납부 처리, 필터 등
- ⚠️ **버그 발견**: 환불 금액 검증, 환불 목록 조회 API
- 📊 **성공률**: 92.3% (12/13 테스트 통과)

### 즉시 조치 필요

1. **Bug #1 수정** (환불 금액 검증)
2. **Bug #2 수정** (환불 목록 조회 API)
3. 수정 후 재테스트

### 다음 단계

1. 버그 수정
2. Inactive 학생 수납 차단 테스트 추가
3. 전체 재테스트
4. 다른 기능 E2E 테스트 진행

---

**테스트 완료 일시**: 2026-02-03 07:34
**테스터**: Claude Sonnet 4.5
**총 소요 시간**: ~15분
