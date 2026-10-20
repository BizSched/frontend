import { expect, test } from '@playwright/test';

test('로그인한 사용자가 대시보드를 볼 수 있다', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: /대시보드/ })).toBeVisible();
  await expect(page.getByText('이번 달 매출 차트')).toBeVisible();
});
