import { expect, test } from '@playwright/test';

test('대시보드에서 매출 대시보드로 이동해 매출 정보를 볼 수 있다', async ({
  page,
}) => {
  // Given: 로그인 상태는 playwright.config의 storageState로 주입된다.

  // When 1: /dashboard에 접속한다.
  await page.goto('/dashboard');

  // Then 1: 오늘 근무와 이번 달 매출 차트가 표시된다.
  await expect(
    page.getByRole('heading', { name: '오늘 근무 아르바이트생' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '이번 달 매출 차트' }),
  ).toBeVisible();

  // When 2: 이번 달 매출 차트의 '자세히 보기'를 클릭한다.
  await page.getByRole('link', { name: '자세히 보기' }).click();

  // Then 2: /sales/dashboard로 이동해 매출 요약·차트·카테고리 구성·입력 내역이 표시된다.
  await expect(page).toHaveURL(/\/sales\/dashboard$/);
  await expect(
    page.getByRole('heading', { name: '매출 대시보드' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '이번 달 누적' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '매출 차트', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '카테고리 구성' }),
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: '입력한 매출' }),
  ).toBeVisible();
});
