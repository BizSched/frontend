import { expect, test } from '@playwright/test';

const ORIGIN = 'http://localhost:3000';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('회원가입', () => {
  test.describe(() => {
    const password = 'e2etest1234';
    let email: string;

    test.beforeEach(() => {
      email = `e2e-signup-${Date.now()}-${test.info().workerIndex}@example.com`;
    });

    test.afterEach(async ({ page }) => {
      const loginResponse = await page.request.post('/api/auth/login', {
        headers: { Origin: ORIGIN },
        data: { email, password },
      });
      if (test.info().status === 'passed') {
        expect(
          loginResponse.ok(),
          `정리 로그인 ${loginResponse.status()}: ${await loginResponse.text()}`,
        ).toBe(true);
      }
      if (!loginResponse.ok()) return;

      const withdrawResponse = await page.request.delete('/api/users/me', {
        headers: { Origin: ORIGIN },
        data: { withdrawalAgreed: true, password },
      });
      expect(
        withdrawResponse.ok(),
        `탈퇴 ${withdrawResponse.status()}: ${await withdrawResponse.text()}`,
      ).toBe(true);
    });

    test('사용자는 이메일로 회원가입을 할 수 있다.', async ({ page }) => {
      await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
        await page.goto('/signup', { waitUntil: 'networkidle' });
        // NOTE: hydration 전에 입력하면 React Hook Form이 기본값으로 덮어써 입력이 지워진다. 드롭다운은 hydration 뒤에만 열리므로 한 번 열고 닫아 준비를 기다린다
        await page.getByRole('button', { name: '업종을 선택해주세요' }).click();
        await expect(
          page.getByRole('menuitem', { name: '카페' }),
        ).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.getByRole('menuitem', { name: '카페' })).toBeHidden();
      });

      await test.step('When: 가입 정보를 입력하고 업종 선택, 전체 동의 후 회원가입 하기 버튼을 클릭한다', async () => {
        await page.getByLabel('이름').fill('E2E 사장님');
        await page.getByLabel('이메일').fill(email);
        await page.getByLabel('비밀번호', { exact: true }).fill(password);
        await page.getByLabel('비밀번호 확인', { exact: true }).fill(password);
        await page.getByRole('button', { name: '업종을 선택해주세요' }).click();
        await page.getByRole('menuitem', { name: '카페' }).click();
        await page.getByRole('checkbox', { name: /^전체 동의/ }).click();
        await page.getByRole('button', { name: '회원가입 하기' }).click();
      });

      await test.step('Then: 로그인 페이지로 이동한다', async () => {
        await expect(page).toHaveURL('/login');
      });
    });
  });

  test('사용자는 입력한 비밀번호를 보거나 가릴 수 있다.', async ({ page }) => {
    const passwordInput = page.getByLabel('비밀번호', { exact: true });
    const passwordConfirmInput = page.getByLabel('비밀번호 확인', {
      exact: true,
    });
    const passwordVisibilityButton = page
      .locator('[data-slot="auth-field"]')
      .filter({ has: passwordInput })
      .getByRole('button', { name: '비밀번호 보기' });
    const passwordConfirmVisibilityButton = page
      .locator('[data-slot="auth-field"]')
      .filter({ has: passwordConfirmInput })
      .getByRole('button', { name: '비밀번호 보기' });

    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('When 1: 비밀번호와 비밀번호 확인을 입력하고 각 칸의 비밀번호 보기 버튼을 클릭한다', async () => {
      await passwordInput.fill('password1234');
      await passwordConfirmInput.fill('password1234');
      await passwordVisibilityButton.click();
      await passwordConfirmVisibilityButton.click();
    });

    await test.step('Then 1: 각 칸의 비밀번호가 글자로 보인다', async () => {
      await expect(passwordInput).toHaveAttribute('type', 'text');
      await expect(passwordConfirmInput).toHaveAttribute('type', 'text');
    });

    await test.step('When 2: 각 칸의 비밀번호 보기 버튼을 다시 클릭한다', async () => {
      await passwordVisibilityButton.click();
      await passwordConfirmVisibilityButton.click();
    });

    await test.step('Then 2: 각 칸의 비밀번호가 다시 가려진다', async () => {
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(passwordConfirmInput).toHaveAttribute('type', 'password');
    });
  });

  test('사용자는 업종을 선택할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('When: 업종 드롭다운에서 카페를 선택한다', async () => {
      await page.getByRole('button', { name: '업종을 선택해주세요' }).click();
      await page.getByRole('menuitem', { name: '카페' }).click();
    });

    await test.step('Then: 업종 드롭다운에 카페가 표시된다', async () => {
      await expect(page.getByRole('button', { name: '카페' })).toBeVisible();
    });
  });

  test('사용자는 업종을 직접 입력할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('When: 업종 드롭다운에서 직접입력을 선택하고 업종을 입력한다', async () => {
      await page.getByRole('button', { name: '업종을 선택해주세요' }).click();
      await page.getByRole('menuitem', { name: '직접입력' }).click();
      await page.getByLabel('업종 직접 입력').fill('꽃집');
    });

    await test.step('Then: 업종 드롭다운에 직접입력이, 입력칸에 입력한 업종이 표시된다', async () => {
      await expect(
        page.getByRole('button', { name: '직접입력' }),
      ).toBeVisible();
      await expect(page.getByLabel('업종 직접 입력')).toHaveValue('꽃집');
    });
  });

  test('사용자는 소셜 회원가입을 시작할 수 있다.', async ({ page }) => {
    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('Then: 구글·카카오 버튼이 각 로그인 시작 주소로 연결된다', async () => {
      await expect(
        page.getByRole('link', { name: '구글로 회원가입' }),
      ).toHaveAttribute('href', '/api/oauth/google/authorize');
      await expect(
        page.getByRole('link', { name: '카카오로 회원가입' }),
      ).toHaveAttribute('href', '/api/oauth/kakao/authorize');
    });
  });

  test('사용자는 이용 약관 전문을 확인하고 닫을 수 있다.', async ({ page }) => {
    const firstTerm = page
      .getByRole('group', { name: '약관 동의' })
      .getByRole('listitem')
      .first();
    const documentButton = firstTerm.getByRole('button', {
      name: /전문 보기$/,
    });
    const termsModal = page.getByRole('dialog');
    let termTitle = '';

    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('When 1: 첫 번째 약관의 전문 보기 버튼을 클릭한다', async () => {
      const documentLabel = await documentButton.getAttribute('aria-label');
      termTitle = documentLabel!.replace(/ 전문 보기$/, '');
      await documentButton.click();
    });

    await test.step('Then 1: 해당 약관 제목과 본문이 담긴 모달이 열린다', async () => {
      await expect(termsModal).toBeVisible();
      await expect(
        termsModal.getByRole('heading', { name: termTitle }),
      ).toBeVisible();
      await expect(termsModal.locator('[data-slot="modal-body"]')).toHaveText(
        /\S/,
      );
    });

    await test.step('When 2: 모달 아래의 닫기 버튼을 클릭한다', async () => {
      await termsModal.getByRole('button', { name: '닫기' }).last().click();
    });

    await test.step('Then 2: 모달이 닫히고 약관은 체크되지 않은 상태로 남는다', async () => {
      await expect(termsModal).toBeHidden();
      await expect(firstTerm.getByRole('checkbox')).not.toBeChecked();
    });
  });

  test('사용자는 이용 약관에 하나씩 동의할 수 있다.', async ({ page }) => {
    const termCheckboxes = page
      .getByRole('group', { name: '약관 동의' })
      .getByRole('listitem')
      .getByRole('checkbox');

    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
      await expect(termCheckboxes.first()).toBeVisible();
    });

    await test.step('When: 약관 목록의 체크박스를 하나씩 모두 클릭한다', async () => {
      for (const termCheckbox of await termCheckboxes.all()) {
        await termCheckbox.click();
      }
    });

    await test.step('Then: 모든 약관과 전체 동의 체크박스가 체크된다', async () => {
      for (const termCheckbox of await termCheckboxes.all()) {
        await expect(termCheckbox).toBeChecked();
      }
      await expect(
        page.getByRole('checkbox', { name: /^전체 동의/ }),
      ).toBeChecked();
    });
  });

  test('사용자는 전체 동의로 모든 약관에 동의할 수 있다.', async ({ page }) => {
    const termCheckboxes = page
      .getByRole('group', { name: '약관 동의' })
      .getByRole('listitem')
      .getByRole('checkbox');

    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
      await expect(termCheckboxes.first()).toBeVisible();
    });

    await test.step('When: 전체 동의 체크박스를 클릭한다', async () => {
      await page.getByRole('checkbox', { name: /^전체 동의/ }).click();
    });

    await test.step('Then: 필수·선택 약관이 모두 체크된다', async () => {
      for (const termCheckbox of await termCheckboxes.all()) {
        await expect(termCheckbox).toBeChecked();
      }
    });
  });

  test('사용자는 약관 전문에서 동의하기를 눌러 해당 약관에 동의할 수 있다.', async ({
    page,
  }) => {
    const termItems = page
      .getByRole('group', { name: '약관 동의' })
      .getByRole('listitem');

    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('When: 첫 번째 약관의 전문 보기 버튼을 클릭하고 동의하기 버튼을 클릭한다', async () => {
      await termItems
        .first()
        .getByRole('button', { name: /전문 보기$/ })
        .click();
      await page
        .getByRole('dialog')
        .getByRole('button', { name: '동의하기' })
        .click();
    });

    await test.step('Then: 모달이 닫히고 첫 번째 약관만 체크된다', async () => {
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(termItems.first().getByRole('checkbox')).toBeChecked();
      for (const termItem of (await termItems.all()).slice(1)) {
        await expect(termItem.getByRole('checkbox')).not.toBeChecked();
      }
    });
  });

  test('사용자는 회원가입 페이지에서 로그인 페이지로 이동할 수 있다.', async ({
    page,
  }) => {
    await test.step('Given: 로그인하지 않은 상태에서 회원가입 페이지에 접근한다', async () => {
      await page.goto('/signup', { waitUntil: 'networkidle' });
    });

    await test.step('When: 로그인 링크를 클릭한다', async () => {
      await page.getByRole('link', { name: '로그인', exact: true }).click();
    });

    await test.step('Then: 로그인 페이지로 이동한다', async () => {
      await expect(page).toHaveURL('/login');
    });
  });
});
