import { expect, test } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('로그인', () => {
  test('사용자는 이메일로 로그인할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인하지 않은 상태에서 로그인 페이지에 접근한다', async () => {
      await page.goto('/login', { waitUntil: 'networkidle' });
    });

    await test.step('When: 이메일과 비밀번호를 입력하고 로그인하기 버튼을 클릭한다', async () => {
      await page.getByLabel('이메일').fill(process.env.E2E_EMAIL!);
      await page
        .getByLabel('비밀번호', { exact: true })
        .fill(process.env.E2E_PASSWORD!);
      await page.getByRole('button', { name: '로그인하기' }).click();
    });

    await test.step('Then: 대시보드로 이동하고 {name}님의 대시보드 제목이 표시된다', async () => {
      await expect(page).toHaveURL('/dashboard');
      await expect(
        page.getByRole('heading', { name: /님의 대시보드$/ }),
      ).toBeVisible();
    });
  });

  test('사용자는 자동 로그인을 선택해 로그인할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인하지 않은 상태에서 로그인 페이지에 접근한다', async () => {
      await page.goto('/login', { waitUntil: 'networkidle' });
    });

    await test.step('When: 이메일과 비밀번호를 입력하고 자동 로그인을 선택해 로그인하기 버튼을 클릭한다', async () => {
      await page.getByLabel('이메일').fill(process.env.E2E_EMAIL!);
      await page
        .getByLabel('비밀번호', { exact: true })
        .fill(process.env.E2E_PASSWORD!);
      await page.getByRole('checkbox', { name: '자동 로그인' }).click();
      await page.getByRole('button', { name: '로그인하기' }).click();
    });

    await test.step('Then: 대시보드로 이동하고 로그인 쿠키가 30일 동안 유지되도록 저장된다', async () => {
      await expect(page).toHaveURL('/dashboard');
      const cookies = await page.context().cookies();
      const refreshToken = cookies.find(({ name }) => name === 'refresh_token');
      const twentyNineDaysLater = Date.now() / 1000 + 29 * 24 * 60 * 60;
      expect(refreshToken?.expires).toBeGreaterThan(twentyNineDaysLater);
    });
  });

  test('사용자는 입력한 비밀번호를 보거나 가릴 수 있다.', async ({ page }) => {
    const passwordInput = page.getByLabel('비밀번호', { exact: true });
    const visibilityButton = page.getByRole('button', {
      name: '비밀번호 보기',
    });

    await test.step('Given: 로그인하지 않은 상태에서 로그인 페이지에 접근한다', async () => {
      await page.goto('/login', { waitUntil: 'networkidle' });
    });

    await test.step('When 1: 비밀번호를 입력하고 비밀번호 보기 버튼을 클릭한다', async () => {
      await passwordInput.fill('password1234');
      await visibilityButton.click();
    });

    await test.step('Then 1: 입력한 비밀번호가 글자로 보인다', async () => {
      await expect(passwordInput).toHaveAttribute('type', 'text');
    });

    await test.step('When 2: 비밀번호 보기 버튼을 다시 클릭한다', async () => {
      await visibilityButton.click();
    });

    await test.step('Then 2: 비밀번호가 다시 가려진다', async () => {
      await expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  test('사용자는 로그인 페이지에서 회원가입 페이지로 이동할 수 있다.', async ({
    page,
  }) => {
    await test.step('Given: 로그인하지 않은 상태에서 로그인 페이지에 접근한다', async () => {
      await page.goto('/login', { waitUntil: 'networkidle' });
    });

    await test.step('When: 회원가입 링크를 클릭한다', async () => {
      await page.getByRole('link', { name: '회원가입' }).click();
    });

    await test.step('Then: 회원가입 페이지로 이동한다', async () => {
      await expect(page).toHaveURL('/signup');
    });
  });

  test('사용자는 소셜 로그인을 시작할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인하지 않은 상태에서 로그인 페이지에 접근한다', async () => {
      await page.goto('/login', { waitUntil: 'networkidle' });
    });

    await test.step('Then: 구글·카카오 버튼이 각 로그인 시작 주소로 연결된다', async () => {
      await expect(
        page.getByRole('link', { name: '구글로 로그인' }),
      ).toHaveAttribute('href', '/api/oauth/google/authorize');
      await expect(
        page.getByRole('link', { name: '카카오로 로그인' }),
      ).toHaveAttribute('href', '/api/oauth/kakao/authorize');
    });
  });

  test('사용자는 로그아웃할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인한 상태에서 대시보드 페이지에 접근한다', async () => {
      await page.goto('/login', { waitUntil: 'networkidle' });
      await page.getByLabel('이메일').fill(process.env.E2E_EMAIL!);
      await page
        .getByLabel('비밀번호', { exact: true })
        .fill(process.env.E2E_PASSWORD!);
      await page.getByRole('button', { name: '로그인하기' }).click();
      await expect(page).toHaveURL('/dashboard');
    });

    await test.step('When 1: 사이드바를 펼치고 로그아웃 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: '사이드바 펼치기' }).click();
      await page.getByRole('button', { name: '로그아웃' }).click();
    });

    await test.step('Then 1: 로그인 페이지로 이동한다', async () => {
      await expect(page).toHaveURL('/login');
    });

    await test.step('When 2: 대시보드 주소로 직접 접근한다', async () => {
      await page.goto('/dashboard');
    });

    await test.step('Then 2: 로그인 페이지로 이동한다', async () => {
      await expect(page).toHaveURL('/login');
    });
  });
});
