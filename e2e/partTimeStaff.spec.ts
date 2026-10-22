import {
  type APIRequestContext,
  expect,
  type Locator,
  type Page,
  test,
} from '@playwright/test';

import {
  createPartTimeApi,
  createStaff,
  deleteStaff,
  getStaffTotalCount,
} from './partTimeApi';

// NOTE: 등록한 아르바이트생을 이후 시나리오에서 보고 수정·삭제하므로 순서대로 실행한다.
test.describe.configure({ mode: 'serial' });

// NOTE: 목록이 이름순이라 기존 데이터보다 앞에 오도록 영문 접두사를 쓰고, 브라우저 프로젝트마다 겹치지 않도록 실행마다 다른 접미사를 붙인다.
const RUN_ID = Date.now().toString().slice(-6);
const STAFF_LIST_PAGE_SIZE = 10;
const LIST_STAFF = `E2E목록${RUN_ID}`;
const LIST_STAFF_PHONE = '010-0000-1111';
const NEW_STAFF = `E2E등록${RUN_ID}`;
const ATTACHMENT_STAFF = `E2E첨부${RUN_ID}`;
const ATTACHMENT_NAME = 'e2e-attachment.pdf';
const ATTACHMENT_FILE = {
  name: ATTACHMENT_NAME,
  mimeType: 'application/pdf',
  buffer: Buffer.from(
    [
      '%PDF-1.4',
      '1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj',
      '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj',
      '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj',
      'trailer<</Root 1 0 R>>',
      '%%EOF',
    ].join('\n'),
  ),
};

let api: APIRequestContext;
const seededStaffIds: number[] = [];
let newStaffId: number | undefined;
let attachmentStaffId: number | undefined;

const getStaffCard = (page: Page, name: string) =>
  page
    .getByRole('listitem')
    .filter({ has: page.getByRole('button', { name: `${name} 상세 보기` }) });

// NOTE: 상세 정보는 항목 이름(dt) 바로 뒤의 값(dd)으로 짝지어 확인한다.
const getDetailField = (detail: Locator, label: string) =>
  detail
    .getByRole('term')
    .filter({ hasText: new RegExp(`^${label}$`) })
    .locator('xpath=following-sibling::dd[1]');

const getStaffIdFromUrl = (page: Page) =>
  Number(new URL(page.url()).searchParams.get('staffId'));

const getCardNames = (page: Page) =>
  page
    .getByRole('button', { name: / 상세 보기$/ })
    .evaluateAll((buttons) =>
      buttons.map((button) =>
        button.getAttribute('aria-label')?.replace(/ 상세 보기$/, ''),
      ),
    );

const uploadAttachment = async (page: Page) => {
  const dialog = page.getByRole('dialog', { name: '첨부파일 업로드' });

  await page.getByRole('button', { name: '첨부파일 업로드' }).click();
  const fileChooserPromise = page.waitForEvent('filechooser');
  await dialog.getByRole('button', { name: '파일을 선택해주세요' }).click();
  await (await fileChooserPromise).setFiles(ATTACHMENT_FILE);
  await dialog.getByRole('button', { name: '업로드', exact: true }).click();
};

test.beforeAll(async ({ playwright }, testInfo) => {
  api = await createPartTimeApi(playwright.request, testInfo.project.use);
  seededStaffIds.push(
    await createStaff(api, { name: LIST_STAFF, phone: LIST_STAFF_PHONE }),
  );

  // NOTE: 2페이지가 생기도록 한 페이지보다 많은 아르바이트생을 채운다.
  const missingCount =
    STAFF_LIST_PAGE_SIZE + 1 - (await getStaffTotalCount(api));
  for (let index = 1; index <= missingCount; index += 1) {
    seededStaffIds.push(
      await createStaff(api, { name: `E2E페이지${RUN_ID}-${index}` }),
    );
  }
});

test.afterAll(async () => {
  if (!api) return;

  for (const staffId of [...seededStaffIds, newStaffId, attachmentStaffId]) {
    if (staffId !== undefined) await deleteStaff(api, staffId);
  }
  await api.dispose();
});

test.describe('아르바이트생 관리', () => {
  test('사용자는 아르바이트생 목록을 볼 수 있다.', async ({ page }) => {
    const card = getStaffCard(page, LIST_STAFF);

    await test.step('Given: 로그인한 상태이고 등록된 아르바이트생이 1명 이상 있다', async () => {
      expect(await getStaffTotalCount(api)).toBeGreaterThan(0);
    });

    await test.step('When: 아르바이트생 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff');
    });

    await test.step('Then: 아르바이트생 카드 목록에 이름, 재직 상태, 번호가 표시된다', async () => {
      await expect(card).toContainText(LIST_STAFF);
      await expect(card).toContainText('재직');
      await expect(card).toContainText(LIST_STAFF_PHONE);
    });
  });

  test('사용자는 페이지를 넘겨 다음 목록을 볼 수 있다.', async ({ page }) => {
    let firstPageNames: (string | undefined)[] = [];

    await test.step('Given: 등록된 아르바이트생이 11명 이상인 상태로 아르바이트생 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff');
      await expect(
        page.getByRole('button', { name: / 상세 보기$/ }),
      ).toHaveCount(STAFF_LIST_PAGE_SIZE);
      firstPageNames = await getCardNames(page);
    });

    await test.step('When: 2페이지로 이동 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: '2페이지로 이동' }).click();
    });

    await test.step('Then: 2페이지가 선택되고 1페이지와 다른 아르바이트생 카드가 표시된다', async () => {
      await expect(
        page.getByRole('button', { name: '2페이지로 이동' }),
      ).toHaveAttribute('aria-current', 'page');
      await expect
        .poll(async () => {
          const names = await getCardNames(page);
          return (
            names.length > 0 &&
            names.every((name) => !firstPageNames.includes(name))
          );
        })
        .toBe(true);
    });
  });

  test('사용자는 아르바이트생을 등록할 수 있다.', async ({ page }) => {
    const detail = page.getByRole('dialog', { name: NEW_STAFF });

    await test.step('Given: 로그인한 상태에서 아르바이트생 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff');
    });

    await test.step('When: + 아르바이트생 버튼을 클릭해 정보를 입력하고 등록하기 버튼을 클릭한다', async () => {
      await page
        .getByRole('main')
        .getByRole('button', { name: '아르바이트생', exact: true })
        .click();
      await expect(page).toHaveURL(/\/partTime\/staff\/new$/);

      await page.getByLabel('아르바이트생 이름').fill(NEW_STAFF);
      await page.getByLabel('생년월일').fill('20000101');
      await page
        .getByRole('radiogroup', { name: '성별' })
        .getByText('여성')
        .click();
      await page.getByLabel('번호', { exact: true }).fill('01012345678');
      await page.getByLabel('시급').fill('10030');
      await page.getByLabel('메모').fill('E2E 등록 메모');
      await page.getByRole('button', { name: '등록하기' }).click();
    });

    await test.step('Then: 아르바이트생 관리 페이지로 이동하고 등록한 아르바이트생의 상세에 입력한 정보가 표시된다', async () => {
      await expect(page).toHaveURL(/\/partTime\/staff\?staffId=\d+$/);
      newStaffId = getStaffIdFromUrl(page);
      await expect(
        detail.getByRole('heading', { name: NEW_STAFF }),
      ).toBeVisible();
      await expect(getDetailField(detail, '생년월일')).toHaveText('2000.01.01');
      await expect(getDetailField(detail, '성별')).toHaveText('여성');
      await expect(getDetailField(detail, '번호')).toHaveText('010-1234-5678');
      await expect(getDetailField(detail, '시급')).toHaveText('10,030원');
      await expect(detail.getByText('E2E 등록 메모')).toBeVisible();
    });
  });

  test('사용자는 아르바이트생을 등록할 때 첨부파일을 올릴 수 있다.', async ({
    page,
  }) => {
    const uploadDialog = page.getByRole('dialog', { name: '첨부파일 업로드' });
    const attachment = page.getByRole('button', {
      name: `${ATTACHMENT_NAME} 열기`,
    });

    await test.step('Given: 로그인한 상태에서 아르바이트생 등록 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff/new');
    });

    await test.step('When 1: 첨부파일 업로드 버튼을 클릭해 파일을 선택하고 업로드 버튼을 클릭한다', async () => {
      await uploadAttachment(page);
    });

    await test.step('Then 1: 모달이 닫히고 첨부파일 목록에 파일 이름이 표시된다', async () => {
      await expect(uploadDialog).toBeHidden();
      await expect(attachment).toBeVisible();
    });

    await test.step('When 2: 이름과 번호를 입력하고 등록하기 버튼을 클릭한다', async () => {
      await page.getByLabel('아르바이트생 이름').fill(ATTACHMENT_STAFF);
      await page.getByLabel('번호', { exact: true }).fill('01011112222');
      await page.getByRole('button', { name: '등록하기' }).click();
    });

    await test.step('Then 2: 등록한 아르바이트생의 상세에 첨부파일이 표시된다', async () => {
      await expect(page).toHaveURL(/\/partTime\/staff\?staffId=\d+$/);
      attachmentStaffId = getStaffIdFromUrl(page);
      await expect(
        page
          .getByRole('dialog', { name: ATTACHMENT_STAFF })
          .getByRole('button', { name: `${ATTACHMENT_NAME} 열기` }),
      ).toBeVisible();
    });
  });

  test('사용자는 올린 첨부파일을 미리 보거나 뺄 수 있다.', async ({ page }) => {
    const attachment = page.getByRole('button', {
      name: `${ATTACHMENT_NAME} 열기`,
    });

    await test.step('Given: 아르바이트생 등록 페이지에서 첨부파일을 하나 올린다', async () => {
      await page.goto('/partTime/staff/new');
      await uploadAttachment(page);
      await expect(attachment).toBeVisible();
    });

    await test.step('When 1: 첨부파일 목록에서 파일 이름을 클릭한다', async () => {
      await attachment.click();
    });

    await test.step('Then 1: 첨부파일 미리보기가 열린다', async () => {
      await expect(
        page.getByRole('region', { name: `${ATTACHMENT_NAME} 미리보기` }),
      ).toBeVisible();
    });

    await test.step('When 2: 파일 이름 옆의 삭제(X) 버튼을 클릭한다', async () => {
      await page
        .getByRole('button', { name: `${ATTACHMENT_NAME} 삭제` })
        .click();
    });

    await test.step('Then 2: 첨부파일 목록에서 파일이 사라진다', async () => {
      await expect(attachment).toBeHidden();
    });
  });

  test('사용자는 카드를 눌러 아르바이트생 상세를 볼 수 있다.', async ({
    page,
  }) => {
    const detail = page.getByRole('dialog', { name: NEW_STAFF });

    await test.step('Given: 로그인한 상태에서 아르바이트생 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff');
    });

    await test.step('When: 아르바이트생 카드를 클릭한다', async () => {
      await page
        .getByRole('button', { name: `${NEW_STAFF} 상세 보기` })
        .click();
    });

    await test.step('Then: 상세에 이름, 재직 상태, 생년월일, 성별, 번호, 시급, 이번 주 근무 스케줄이 표시된다', async () => {
      await expect(
        detail.getByRole('heading', { name: NEW_STAFF }),
      ).toBeVisible();
      await expect(
        detail.getByRole('group', { name: '재직 상태' }),
      ).toContainText('재직');
      await expect(getDetailField(detail, '생년월일')).toHaveText('2000.01.01');
      await expect(getDetailField(detail, '성별')).toHaveText('여성');
      await expect(getDetailField(detail, '번호')).toHaveText('010-1234-5678');
      await expect(getDetailField(detail, '시급')).toHaveText('10,030원');
      await expect(
        detail.getByRole('heading', { name: /주 근무 스케줄$/ }),
      ).toBeVisible();
    });
  });

  test('사용자는 상세에서 첨부파일을 미리 보고 다운로드할 수 있다.', async ({
    page,
  }) => {
    const detail = page.getByRole('dialog', { name: ATTACHMENT_STAFF });
    const downloadNames: string[] = [];

    await test.step('Given: 첨부파일이 있는 아르바이트생의 상세를 연다', async () => {
      await page.goto(`/partTime/staff?staffId=${attachmentStaffId}`);
    });

    await test.step('When 1: 첨부파일 이름을 클릭한다', async () => {
      await detail
        .getByRole('button', { name: `${ATTACHMENT_NAME} 열기` })
        .click();
    });

    await test.step('Then 1: 첨부파일 미리보기가 열린다', async () => {
      await expect(
        detail.getByRole('region', { name: `${ATTACHMENT_NAME} 미리보기` }),
      ).toBeVisible();
    });

    await test.step('When 2: 다운로드 버튼을 클릭한다', async () => {
      // NOTE: headless 브라우저는 PDF 미리보기 iframe도 임의 이름으로 다운로드하므로 모든 다운로드 이름을 모은다.
      page.on('download', (download) => {
        downloadNames.push(download.suggestedFilename());
      });
      await detail.getByRole('link', { name: '다운로드' }).click();
    });

    await test.step('Then 2: 같은 이름의 파일이 다운로드된다', async () => {
      await expect.poll(() => downloadNames).toContain(ATTACHMENT_NAME);
    });
  });

  test('사용자는 첨부파일 미리보기를 접거나 펼칠 수 있다.', async ({
    page,
  }) => {
    const detail = page.getByRole('dialog', { name: ATTACHMENT_STAFF });
    const download = detail.getByRole('link', { name: '다운로드' });

    await test.step('Given: 아르바이트생 상세의 첨부파일 미리보기를 연다', async () => {
      await page.goto(`/partTime/staff?staffId=${attachmentStaffId}`);
      await detail
        .getByRole('button', { name: `${ATTACHMENT_NAME} 열기` })
        .click();
      await expect(download).toBeVisible();
    });

    await test.step('When 1: 첨부파일 미리보기 접기 버튼을 클릭한다', async () => {
      await detail
        .getByRole('button', { name: '첨부파일 미리보기 접기' })
        .click();
    });

    await test.step('Then 1: 미리보기가 접혀 탭만 남는다', async () => {
      await expect(
        detail.getByRole('button', { name: '첨부파일 미리보기 펼치기' }),
      ).toHaveAttribute('aria-expanded', 'false');
      await expect(download).toBeHidden();
    });

    await test.step('When 2: 첨부파일 미리보기 펼치기 버튼을 클릭한다', async () => {
      await detail
        .getByRole('button', { name: '첨부파일 미리보기 펼치기' })
        .click();
    });

    await test.step('Then 2: 미리보기가 다시 펼쳐진다', async () => {
      await expect(
        detail.getByRole('button', { name: '첨부파일 미리보기 접기' }),
      ).toHaveAttribute('aria-expanded', 'true');
      await expect(download).toBeVisible();
    });
  });

  test('사용자는 상세에서 재직 상태를 바꿀 수 있다.', async ({ page }) => {
    const detail = page.getByRole('dialog', { name: NEW_STAFF });
    const status = detail.getByRole('group', { name: '재직 상태' });
    const confirmDialog = page.getByRole('dialog', {
      name: '재직 상태를 바꾸시겠어요?',
    });

    await test.step('Given: 재직 중인 아르바이트생의 상세를 연다', async () => {
      await page.goto(`/partTime/staff?staffId=${newStaffId}`);
      await expect(status).toContainText('재직');
    });

    await test.step('When: 재직 상태 드롭다운에서 휴직을 선택하고 확인 모달에서 변경 버튼을 클릭한다', async () => {
      await status.getByRole('button').click();
      await page.getByRole('menuitem', { name: '휴직', exact: true }).click();
      await confirmDialog.getByRole('button', { name: '변경' }).click();
    });

    await test.step('Then: 상세와 카드의 재직 상태가 휴직으로 표시된다', async () => {
      await expect(confirmDialog).toBeHidden();
      await expect(status).toContainText('휴직');
      await detail.getByRole('button', { name: '닫기' }).click();
      await expect(getStaffCard(page, NEW_STAFF)).toContainText('휴직');
    });
  });

  test('사용자는 상세를 닫을 수 있다.', async ({ page }) => {
    const detail = page.getByRole('dialog', { name: NEW_STAFF });

    await test.step('Given: 아르바이트생 상세를 연다', async () => {
      await page.goto('/partTime/staff');
      await page
        .getByRole('button', { name: `${NEW_STAFF} 상세 보기` })
        .click();
      await expect(detail).toBeVisible();
    });

    await test.step('When: 닫기 버튼을 클릭한다', async () => {
      await detail.getByRole('button', { name: '닫기' }).click();
    });

    await test.step('Then: 상세가 닫히고 아르바이트생 목록이 표시된다', async () => {
      await expect(detail).toBeHidden();
      await expect(page).toHaveURL(/\/partTime\/staff$/);
      await expect(
        page.getByRole('button', { name: `${NEW_STAFF} 상세 보기` }),
      ).toBeVisible();
    });
  });

  test('사용자는 더보기 메뉴로 아르바이트생 정보를 수정할 수 있다.', async ({
    page,
  }) => {
    await test.step('Given: 로그인한 상태에서 아르바이트생 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff');
    });

    await test.step('When: 더보기 메뉴의 수정하기로 이동해 번호를 바꾸고 수정하기 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: `${NEW_STAFF} 더보기` }).click();
      await page.getByRole('menuitem', { name: '수정하기' }).click();
      await expect(page).toHaveURL(/\/partTime\/staff\/\d+\/edit$/);

      await expect(page.getByLabel('아르바이트생 이름')).toHaveValue(NEW_STAFF);
      await page.getByLabel('번호', { exact: true }).fill('01087654321');
      await page.getByRole('button', { name: '수정하기', exact: true }).click();
    });

    await test.step('Then: 아르바이트생 관리 페이지로 이동하고 상세에 바뀐 번호가 표시된다', async () => {
      await expect(page).toHaveURL(/\/partTime\/staff\?staffId=\d+$/);
      await expect(
        getDetailField(page.getByRole('dialog', { name: NEW_STAFF }), '번호'),
      ).toHaveText('010-8765-4321');
    });
  });

  test('사용자는 더보기 메뉴로 아르바이트생을 삭제할 수 있다.', async ({
    page,
  }) => {
    const confirmDialog = page.getByRole('dialog', {
      name: '아르바이트생을 삭제하시겠어요?',
    });

    await test.step('Given: 로그인한 상태에서 아르바이트생 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/staff');
    });

    await test.step('When: 더보기 메뉴의 삭제하기를 누르고 확인 모달에서 삭제 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: `${NEW_STAFF} 더보기` }).click();
      await page.getByRole('menuitem', { name: '삭제하기' }).click();
      await confirmDialog.getByRole('button', { name: '삭제' }).click();
    });

    await test.step('Then: 모달이 닫히고 목록에서 해당 아르바이트생 카드가 사라진다', async () => {
      await expect(confirmDialog).toBeHidden();
      await expect(
        page.getByRole('button', { name: `${NEW_STAFF} 상세 보기` }),
      ).toBeHidden();
    });
  });
});
