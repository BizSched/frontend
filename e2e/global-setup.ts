import { chromium } from '@playwright/test';

// eslint-disable-next-line import/no-default-export -- Playwright requires a default export.
export default async function globalSetup() {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error('E2E_EMAIL과 E2E_PASSWORD를 .env.local에 설정해 주세요.');
  }

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    await page.goto('http://localhost:3000/login');
    await page.getByLabel('이메일').fill(email);
    await page.getByLabel('비밀번호', { exact: true }).fill(password);
    await page.getByRole('button', { name: '로그인하기' }).click();
    await page.waitForURL('**/dashboard**');

    await page.context().storageState({ path: 'e2e/auth.json' });
  } finally {
    await browser.close();
  }
}
