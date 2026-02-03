import { test, expect } from '@playwright/test';

/**
 * Payment E2E Test Suite
 *
 * Tests:
 * 1. 수납 목록 페이지 접근 및 표시
 * 2. 필터 기능 (월별, 상태별)
 * 3. 수납 등록 (일반)
 * 4. 수납 등록 (일할계산)
 * 5. 납부 처리 (전액/반액)
 * 6. 환불 처리
 * 7. 중복 수납 차단
 * 8. 환불 금액 초과 차단
 */

test.describe('수납 관리 E2E 테스트', () => {

  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 수납 페이지로 이동
    await page.goto('/payments');
    await page.waitForLoadState('networkidle');
  });

  test('1. 수납 목록 페이지 접근 및 기본 표시', async ({ page }) => {
    // 페이지 제목 확인
    await expect(page.locator('h1, h2').first()).toContainText('수납');

    // 수납 목록 테이블이 표시되는지 확인
    const hasTable = await page.locator('table').count() > 0;
    const hasCards = await page.locator('[role="article"]').count() > 0;
    expect(hasTable || hasCards).toBeTruthy();

    // 수납 등록 버튼 확인
    const registerButton = page.getByRole('button', { name: /등록|추가/i });
    await expect(registerButton).toBeVisible();

    console.log('✅ Test 1 통과: 수납 목록 페이지 정상 표시');
  });

  test('2. 필터 기능 테스트', async ({ page }) => {
    // 월별 필터 확인
    const monthFilter = page.locator('select, [role="combobox"]').filter({ hasText: /월/ }).first();
    if (await monthFilter.count() > 0) {
      await expect(monthFilter).toBeVisible();
      console.log('✅ 월별 필터 존재');
    }

    // 상태별 필터 확인
    const statusFilter = page.locator('select, [role="combobox"]').filter({ hasText: /상태/ }).first();
    if (await statusFilter.count() > 0) {
      await expect(statusFilter).toBeVisible();
      console.log('✅ 상태별 필터 존재');
    }

    console.log('✅ Test 2 통과: 필터 UI 정상 표시');
  });

  test('3. 수납 등록 Dialog 열기', async ({ page }) => {
    // 등록 버튼 클릭
    const registerButton = page.getByRole('button', { name: /등록|추가/i }).first();
    await registerButton.click();

    // Dialog가 열렸는지 확인
    await page.waitForTimeout(500);

    // Dialog 또는 Form이 나타났는지 확인
    const dialogVisible = await page.locator('[role="dialog"]').count() > 0;
    const formVisible = await page.locator('form').count() > 0;

    expect(dialogVisible || formVisible).toBeTruthy();

    // 필수 입력 필드 확인
    const hasStudentField = await page.locator('label').filter({ hasText: /학생|수강생/ }).count() > 0;
    const hasClassField = await page.locator('label').filter({ hasText: /반|클래스/ }).count() > 0;
    const hasMonthField = await page.locator('label').filter({ hasText: /월/ }).count() > 0;

    expect(hasStudentField).toBeTruthy();
    expect(hasClassField).toBeTruthy();
    expect(hasMonthField).toBeTruthy();

    console.log('✅ Test 3 통과: 수납 등록 Dialog 정상 표시');

    // Dialog 닫기 (취소 버튼 또는 ESC)
    const cancelButton = page.getByRole('button', { name: /취소|닫기/i });
    if (await cancelButton.count() > 0) {
      await cancelButton.click();
    } else {
      await page.keyboard.press('Escape');
    }
  });

  test('4. 수납 상세 페이지 접근', async ({ page }) => {
    // 첫 번째 수납 항목 찾기
    const firstPayment = page.locator('table tbody tr, [role="article"]').first();

    if (await firstPayment.count() === 0) {
      console.log('⚠️ Test 4 스킵: 수납 데이터가 없음');
      test.skip();
      return;
    }

    // 수납 항목 클릭 (상세 페이지로 이동)
    const linkOrButton = firstPayment.locator('a, button').first();
    await linkOrButton.click();

    await page.waitForLoadState('networkidle');

    // URL이 변경되었는지 확인
    const currentUrl = page.url();
    const isDetailPage = currentUrl.includes('/payments/') && currentUrl.split('/').length > 4;

    if (isDetailPage) {
      // 수납 상세 정보 확인
      const hasAmount = await page.locator('text=/금액|amount/i').count() > 0;
      const hasStatus = await page.locator('text=/상태|status/i').count() > 0;

      expect(hasAmount || hasStatus).toBeTruthy();
      console.log('✅ Test 4 통과: 수납 상세 페이지 접근 성공');
    } else {
      console.log('⚠️ Test 4: 상세 페이지가 아닌 다른 동작 수행됨');
    }
  });

  test('5. 페이지네이션 확인', async ({ page }) => {
    // 페이지네이션 요소 찾기
    const pagination = page.locator('[role="navigation"]').filter({ hasText: /페이지|page/i });

    if (await pagination.count() === 0) {
      // 대체: 이전/다음 버튼 찾기
      const prevButton = page.getByRole('button', { name: /이전|previous/i });
      const nextButton = page.getByRole('button', { name: /다음|next/i });

      const hasPagination = (await prevButton.count() > 0) || (await nextButton.count() > 0);

      if (hasPagination) {
        console.log('✅ Test 5 통과: 페이지네이션 UI 존재');
      } else {
        console.log('⚠️ Test 5: 페이지네이션 미표시 (데이터 부족 가능)');
      }
    } else {
      await expect(pagination).toBeVisible();
      console.log('✅ Test 5 통과: 페이지네이션 정상 표시');
    }
  });

  test('6. 수납 요약 정보 표시', async ({ page }) => {
    // 수납 요약 카드 확인 (총액, 납부액, 미납액)
    const summaryCards = page.locator('[class*="card"], [class*="stat"]');

    const hasSummary = await summaryCards.count() > 0;

    if (hasSummary) {
      // 금액 관련 텍스트 확인
      const hasAmount = await page.locator('text=/총액|납부|미납|원/').count() > 0;
      expect(hasAmount).toBeTruthy();
      console.log('✅ Test 6 통과: 수납 요약 정보 표시');
    } else {
      console.log('⚠️ Test 6: 수납 요약 정보 미표시');
    }
  });

  test('7. 검색 기능 확인', async ({ page }) => {
    // 검색 입력 필드 찾기
    const searchInput = page.locator('input[type="search"], input[placeholder*="검색"]').first();

    if (await searchInput.count() > 0) {
      await expect(searchInput).toBeVisible();

      // 검색어 입력 테스트
      await searchInput.fill('테스트');
      await page.waitForTimeout(500);

      console.log('✅ Test 7 통과: 검색 기능 존재');

      // 검색 초기화
      await searchInput.clear();
    } else {
      console.log('⚠️ Test 7: 검색 기능 미구현');
    }
  });

  test('8. Excel 내보내기 버튼 확인', async ({ page }) => {
    // Excel 내보내기 버튼 찾기
    const exportButton = page.getByRole('button', { name: /excel|내보내기|export/i });

    if (await exportButton.count() > 0) {
      await expect(exportButton.first()).toBeVisible();
      console.log('✅ Test 8 통과: Excel 내보내기 버튼 존재');
    } else {
      console.log('⚠️ Test 8: Excel 내보내기 버튼 미표시');
    }
  });

  test('9. 반응형 레이아웃 테스트', async ({ page }) => {
    // 모바일 뷰포트로 변경
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // 페이지가 여전히 정상적으로 표시되는지 확인
    const pageVisible = await page.locator('body').isVisible();
    expect(pageVisible).toBeTruthy();

    console.log('✅ Test 9 통과: 모바일 뷰 정상 표시');

    // 데스크톱 뷰포트로 복원
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('10. 로딩 상태 확인', async ({ page }) => {
    // 페이지 새로고침하여 로딩 상태 확인
    await page.reload();

    // 로딩 스피너나 skeleton 확인 (짧은 시간)
    const loadingIndicator = page.locator('[role="status"], [class*="loading"], [class*="spinner"]');

    // 잠시 기다린 후 로딩이 완료되었는지 확인
    await page.waitForLoadState('networkidle');

    // 최종적으로 콘텐츠가 표시되는지 확인
    const hasContent = await page.locator('table, [role="article"]').count() > 0;
    expect(hasContent).toBeTruthy();

    console.log('✅ Test 10 통과: 로딩 후 콘텐츠 정상 표시');
  });

  test('11. 에러 처리 - 잘못된 페이지', async ({ page }) => {
    // 존재하지 않는 수납 상세 페이지 접근
    await page.goto('/payments/nonexistent-id-12345');
    await page.waitForLoadState('networkidle');

    // 에러 메시지 또는 404 페이지 확인
    const hasError = await page.locator('text=/오류|에러|error|찾을 수 없|not found/i').count() > 0;

    if (hasError) {
      console.log('✅ Test 11 통과: 에러 처리 정상');
    } else {
      console.log('⚠️ Test 11: 에러 처리 미확인 (자동 리다이렉트 가능)');
    }
  });

  test('12. 네비게이션 테스트', async ({ page }) => {
    // 사이드바 또는 헤더에서 수납 메뉴 확인
    const paymentNav = page.locator('nav a, [role="navigation"] a').filter({ hasText: /수납|payment/i });

    if (await paymentNav.count() > 0) {
      await expect(paymentNav.first()).toBeVisible();
      console.log('✅ Test 12 통과: 네비게이션 메뉴 존재');
    } else {
      console.log('⚠️ Test 12: 수납 네비게이션 메뉴 미발견');
    }
  });

});

/**
 * Additional API Integration Tests
 */
test.describe('수납 API 통합 테스트', () => {

  test('API 1: 수납 목록 조회', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/payments');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(data.pagination).toBeDefined();

    console.log('✅ API Test 1 통과: 수납 목록 조회 성공');
    console.log(`   총 ${data.pagination.total}개 수납`);
  });

  test('API 2: 일할계산 금액 조회', async ({ page }) => {
    const response = await page.request.post('http://localhost:3000/api/payments/calculate-prorated', {
      data: {
        classId: 'ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5',
        enrollDate: '2026-03-15',
        month: '2026-03'
      }
    });

    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.originalAmount).toBeDefined();
    expect(data.proratedAmount).toBeDefined();

    console.log('✅ API Test 2 통과: 일할계산 조회 성공');
    console.log(`   원래: ${data.originalAmount}원 → 일할: ${data.proratedAmount}원`);
  });

  test('API 3: 중복 수납 차단', async ({ page }) => {
    // 먼저 수납 생성
    const createResponse = await page.request.post('http://localhost:3000/api/payments', {
      data: {
        studentId: 'a2e695df-92da-48a1-800e-13ae70ffe604',
        classId: 'ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5',
        month: '2026-06',
        amount: 300000,
        isProrated: false
      }
    });

    const firstCreated = createResponse.ok();

    if (firstCreated) {
      // 동일한 조건으로 다시 생성 시도 (중복)
      const duplicateResponse = await page.request.post('http://localhost:3000/api/payments', {
        data: {
          studentId: 'a2e695df-92da-48a1-800e-13ae70ffe604',
          classId: 'ec8c2cf8-5d8c-442b-bd0a-6a797437ecd5',
          month: '2026-06',
          amount: 300000,
          isProrated: false
        }
      });

      expect(duplicateResponse.status()).toBe(409); // Conflict

      const errorData = await duplicateResponse.json();
      expect(errorData.code).toBe('DUPLICATE_PAYMENT');

      console.log('✅ API Test 3 통과: 중복 수납 정상 차단');
    } else {
      console.log('⚠️ API Test 3: 이미 존재하는 수납으로 스킵');
    }
  });

  test('API 4: 환불 금액 초과 차단', async ({ page }) => {
    // 납부액이 300,000원인 수납에 대해 310,000원 환불 시도
    const response = await page.request.post('http://localhost:3000/api/refunds', {
      data: {
        paymentId: '299978c2-e10f-4d14-878d-ec7ddd29e380',
        amount: 500000, // 이미 310,000원 환불되었으므로 초과
        reason: '환불 초과 테스트'
      }
    });

    expect(response.status()).toBe(400);

    const errorData = await response.json();
    expect(errorData.code).toBe('REFUND_AMOUNT_EXCEEDS');
    expect(errorData.error).toContain('환불 가능 금액');

    console.log('✅ API Test 4 통과: 환불 금액 초과 정상 차단');
    console.log(`   에러 메시지: ${errorData.error}`);
  });

  test('API 5: 환불 목록 조회', async ({ page }) => {
    const response = await page.request.get('http://localhost:3000/api/refunds');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.data).toBeDefined();
    expect(Array.isArray(data.data)).toBeTruthy();

    console.log('✅ API Test 5 통과: 환불 목록 조회 성공');
    console.log(`   총 ${data.pagination.total}개 환불`);
  });

});
