import { expect, type Page, test } from '@playwright/test';

import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';

// NOTE: 시나리오가 서로의 결과(카테고리, 매출)에 의존하므로 순서대로 실행한다.
test.describe.configure({ mode: 'serial' });

const CATEGORY = 'E2E매출';
const RENAMED = 'E2E수정';
const AMOUNT = 10000;
const EDITED_AMOUNT = 25000;

// NOTE: 서비스와 같은 한국 시간 기준으로 날짜를 선택한다.
const dayKey = formatCalendarDate(new Date());
const [year, month, day] = dayKey.split('-').map(Number);
const dateLabel = `${month}월 ${day}일`;
let baseTotal = 0;
let createdCategory = false;
let createdSale = false;
// NOTE: 1280px에서는 사이드바가 접힌 rail이라 펼쳐야 하고, 매출 그룹은 /sales/dashboard에서만 기본으로 열린다.
const openSalesMenu = async (page: Page) => {
  await page.getByRole('button', { name: '사이드바 펼치기' }).click();
  await page.getByRole('button', { name: '매출', exact: true }).click();
};
const won = (amount: number) => amount.toLocaleString('ko-KR');

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage({
    baseURL: 'http://localhost:3000',
    storageState: 'e2e/auth.json',
  });
  try {
    await page.goto('/sales/details');
    await expect(page.getByText(/^합계 [\d,]+ 원$/)).toBeVisible();
    await expect(page.getByText('매출 내역을 불러오는 중입니다.')).toBeHidden();
    expect(
      await page
        .getByRole('button', { name: `${dateLabel} 매출 삭제` })
        .count(),
      `${dateLabel}에 이미 매출이 있습니다. 매출 E2E 전용 계정에서 실행해 주세요.`,
    ).toBe(0);

    const totalText = await page.getByText(/^합계 [\d,]+ 원$/).textContent();
    baseTotal = Number(totalText?.replace(/\D/g, ''));

    await page.getByRole('button', { name: '카테고리 관리' }).click();
    for (const name of [CATEGORY, RENAMED]) {
      expect(
        await page
          .getByRole('button', { name: `${name} 카테고리 삭제` })
          .count(),
        `${name} 카테고리가 이미 있습니다. 매출 E2E 전용 계정에서 실행해 주세요.`,
      ).toBe(0);
    }
  } finally {
    await page.close();
  }
});

test.afterAll(async ({ browser }) => {
  if (!createdCategory && !createdSale) return;

  const page = await browser.newPage({
    baseURL: 'http://localhost:3000',
    storageState: 'e2e/auth.json',
  });
  try {
    await page.goto('/sales/details');
    if (createdSale) {
      const saleDelete = page.getByRole('button', {
        name: `${dateLabel} 매출 삭제`,
      });
      if (await saleDelete.count()) {
        await saleDelete.click();
        await page
          .getByRole('dialog')
          .getByRole('button', { name: '삭제' })
          .click();
        await expect(saleDelete).toBeHidden();
      }
    }
    if (createdCategory) {
      await page.getByRole('button', { name: '카테고리 관리' }).click();
      for (const name of [CATEGORY, RENAMED]) {
        const categoryDelete = page.getByRole('button', {
          name: `${name} 카테고리 삭제`,
        });
        if (await categoryDelete.count()) {
          await categoryDelete.click();
          await page
            .getByRole('dialog')
            .getByRole('button', { name: '삭제' })
            .click();
          await expect(categoryDelete).toBeHidden();
        }
      }
    }
  } finally {
    await page.close();
  }
});

test('1. 카테고리를 추가하면 목록에 표시되고 다시 열어도 유지된다', async ({
  page,
}) => {
  const nameInput = page.getByLabel(`${CATEGORY} 카테고리 이름`);

  await test.step('Given: 로그인 상태이고 이번 테스트용 카테고리와 매출이 없다', async () => {
    await page.goto('/dashboard');
  });

  await test.step('When: 사이드바에서 매출 내역으로 이동해 새 카테고리를 추가한다', async () => {
    await openSalesMenu(page);
    await page.getByRole('link', { name: '매출 내역' }).click();
    await expect(page).toHaveURL(/\/sales\/details/);

    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByLabel('새 카테고리 이름').fill(CATEGORY);
    createdCategory = true;
    await page.getByRole('button', { name: '추가', exact: true }).click();
  });

  await test.step('Then: 새 카테고리가 목록에 표시된다', async () => {
    await expect(nameInput).toBeVisible();
  });

  await test.step('When: 관리 화면을 닫았다가 다시 연다', async () => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('button', { name: '카테고리 관리' }).click();
  });

  await test.step('Then: 새 카테고리가 유지된다', async () => {
    await expect(nameInput).toBeVisible();
  });
});

test('2. 기록 없는 날짜에 매출을 입력하면 저장 안내가 뜨고 모달이 닫힌다', async ({
  page,
}) => {
  const dialog = page.getByRole('dialog', { name: '하루 매출 입력' });

  await test.step('Given: 1번에서 만든 카테고리가 있고 입력할 날짜에 기록이 없다', async () => {
    await page.goto('/sales/details');
  });

  await test.step('When: 매출 대시보드에서 기록 없는 날짜에 카테고리 금액을 입력하고 저장한다', async () => {
    await openSalesMenu(page);
    await page.getByRole('link', { name: '매출 대시보드' }).click();
    await expect(page).toHaveURL(/\/sales\/dashboard/);
    await page.getByRole('button', { name: '오늘 매출 입력' }).click();

    await dialog.getByRole('button', { name: /^\d{4}\.\d{2}\.\d{2}$/ }).click();
    await page.locator(`[data-day="${dayKey}"] button`).click();
    await page.getByRole('button', { name: '확인', exact: true }).click();

    await dialog.getByLabel(CATEGORY).fill(String(AMOUNT));
    await expect(dialog.locator('output')).toHaveText(`${won(AMOUNT)} 원`);
    createdSale = true;
    await dialog.getByRole('button', { name: '저장' }).click();
  });

  await test.step('Then: 저장 성공 안내가 표시되고 입력 모달이 닫힌다', async () => {
    await expect(page.getByText('매출 내역을 저장했어요.')).toBeVisible();
    await expect(dialog).toBeHidden();
  });
});

test('3. 매출 대시보드에서 요약·차트·카테고리 구성·입력한 매출을 보고 모두 보기로 이동한다', async ({
  page,
}) => {
  await test.step('Given: 앞선 시나리오에서 카테고리와 매출을 생성했다', async () => {
    await page.goto('/sales/details');
  });

  await test.step('When: 사이드바에서 매출 대시보드로 이동해 이번 달 매출 요약을 확인한다', async () => {
    await openSalesMenu(page);
    await page.getByRole('link', { name: '매출 대시보드' }).click();
    await expect(page).toHaveURL(/\/sales\/dashboard/);
    await expect(
      page.getByRole('heading', { name: '이번 달 누적' }),
    ).toBeVisible();
    await expect(
      page
        .getByRole('paragraph')
        .filter({ hasText: new RegExp(`^${won(baseTotal + AMOUNT)} 원$`) }),
    ).toBeVisible();
  });

  await test.step('When: 매출 차트의 조회 단위를 변경한다', async () => {
    await page.getByRole('button', { name: '연', exact: true }).click();
  });

  await test.step('Then: 선택한 단위의 차트와 카테고리 구성·입력한 매출이 표시된다', async () => {
    await expect(
      page.getByRole('button', { name: '연', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('figure', { name: `${month}월 월별 매출` }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '카테고리 구성' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '입력한 매출' }),
    ).toBeVisible();
    await expect(
      page.getByRole('figure', { name: `${month}월 카테고리별 매출 구성` }),
    ).toBeVisible();
  });

  await test.step('When: 입력한 매출의 모두 보기를 클릭한다', async () => {
    await page.getByRole('link', { name: '모두 보기' }).click();
  });

  await test.step('Then: /sales/details로 이동한다', async () => {
    await expect(page).toHaveURL(/\/sales\/details/);
  });
});

test('4. 차트 단위를 바꾸고 내역으로 이동해 입력한 날짜의 기록과 월 합계를 확인한다', async ({
  page,
}) => {
  const savedRow = page.getByRole('row').filter({
    has: page.getByRole('time').filter({ hasText: dateLabel }),
  });

  await test.step('Given: 테스트용 매출을 저장했다', async () => {
    await page.goto('/sales/dashboard');
  });

  await test.step('When: 매출 요약·카테고리 구성을 확인하고 차트의 다른 조회 단위를 선택한다', async () => {
    await expect(
      page.getByRole('heading', { name: '이번 달 누적' }),
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '카테고리 구성' }),
    ).toBeVisible();
    await page.getByRole('button', { name: '주', exact: true }).click();
  });

  await test.step('Then: 차트가 선택한 단위로 표시된다', async () => {
    await expect(
      page.getByRole('button', { name: '주', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    await expect(
      page.getByRole('figure', { name: `${month}월 일별 매출` }),
    ).toBeVisible();
  });

  await test.step('When: 모두 보기로 이동해 다른 달을 선택했다가 입력한 날짜가 속한 달을 다시 선택한다', async () => {
    await page.getByRole('link', { name: '모두 보기' }).click();
    await expect(page).toHaveURL(/\/sales\/details/);

    const otherMonth = month === 1 ? 2 : 1;
    await page.getByRole('button', { name: /월 선택/ }).click();
    await page
      .getByRole('menuitem', { name: `${otherMonth}월`, exact: true })
      .click();
    await expect(page).toHaveURL(
      (url) =>
        url.searchParams.get('month') ===
        `${year}-${String(otherMonth).padStart(2, '0')}`,
    );
    await page.getByRole('button', { name: /월 선택/ }).click();
    await page
      .getByRole('menuitem', { name: `${month}월`, exact: true })
      .click();
    await expect(page).toHaveURL(
      (url) => url.searchParams.get('month') === dayKey.slice(0, 7),
    );
  });

  await test.step('Then: 입력한 날짜의 기록과 월 전체 합계가 표시된다', async () => {
    await expect(
      page.getByRole('time').filter({ hasText: dateLabel }),
    ).toBeVisible();
    await expect(savedRow).toContainText(`₩${won(AMOUNT)}`);
    await expect(
      page.getByText(`합계 ${won(baseTotal + AMOUNT)} 원`),
    ).toBeVisible();
  });
});

test('5. 매출을 수정하면 새로고침 후에도 금액과 월 합계가 유지된다', async ({
  page,
}) => {
  await test.step('Given: 2번에서 생성한 매출이 내역에 있다', async () => {
    await page.goto('/sales/details');
  });

  await test.step('When: 해당 날짜의 카테고리 금액을 변경하고 편집 저장한다', async () => {
    await page.getByRole('button', { name: `${dateLabel} 매출 수정` }).click();
    await page
      .getByLabel(`${CATEGORY} ${dateLabel} 매출`)
      .fill(String(EDITED_AMOUNT));
    await page.getByRole('button', { name: `${dateLabel} 편집 저장` }).click();
  });

  await test.step('Then: 수정 성공 안내가 표시된다', async () => {
    await expect(page.getByText('매출 내역을 수정했어요.')).toBeVisible();
  });

  await test.step('When: 페이지를 새로고침한다', async () => {
    await page.reload();
  });

  await test.step('Then: 변경한 금액과 월 전체 합계가 유지된다', async () => {
    await expect(page.getByText(`₩${won(EDITED_AMOUNT)}`)).toBeVisible();
    await expect(
      page.getByText(`합계 ${won(baseTotal + EDITED_AMOUNT)} 원`),
    ).toBeVisible();
  });
});

test('6. 매출을 삭제하면 목록에서 사라지고 월 합계가 갱신된다', async ({
  page,
}) => {
  await test.step('Given: 5번에서 수정한 매출이 있다', async () => {
    await page.goto('/sales/details');
  });

  await test.step('When: 해당 날짜의 매출 삭제를 확인 모달에서 확정한다', async () => {
    await page.getByRole('button', { name: `${dateLabel} 매출 삭제` }).click();
    await page
      .getByRole('dialog')
      .getByRole('button', { name: '삭제' })
      .click();
  });

  await test.step('Then: 삭제 성공 안내가 표시되고 해당 날짜의 매출이 사라지며 월 합계가 갱신된다', async () => {
    await expect(page.getByText('매출 내역을 삭제했어요.')).toBeVisible();
    await expect(
      page.getByRole('time').filter({ hasText: dateLabel }),
    ).toBeHidden();
    await expect(page.getByText(`합계 ${won(baseTotal)} 원`)).toBeVisible();
  });

  await test.step('Then: 새로고침 후에도 갱신된 월 합계가 유지된다', async () => {
    await page.reload();
    await expect(page.getByText(`합계 ${won(baseTotal)} 원`)).toBeVisible();
  });
});

test('7. 카테고리 이름을 수정하면 저장 안내가 뜨고 새 이름이 유지된다', async ({
  page,
}) => {
  await test.step('Given: 1번에서 만든 카테고리가 남아 있다', async () => {
    await page.goto('/sales/details');
  });

  await test.step('When: 카테고리 관리에서 이름을 바꾸고 저장한다', async () => {
    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByLabel(`${CATEGORY} 카테고리 이름`).fill(RENAMED);
    await page.getByRole('button', { name: '저장' }).click();
  });

  await test.step('Then: 저장 성공 안내가 표시된다', async () => {
    await expect(page.getByText('카테고리를 저장했어요.')).toBeVisible();
  });

  await test.step('When: 관리 화면을 다시 연다', async () => {
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('button', { name: '카테고리 관리' }).click();
  });

  await test.step('Then: 변경한 이름이 유지된다', async () => {
    await expect(page.getByLabel(`${RENAMED} 카테고리 이름`)).toBeVisible();
  });
});

test('8. 카테고리를 삭제하면 목록에서 사라진 상태로 유지된다', async ({
  page,
}) => {
  await test.step('Given: 7번에서 이름을 수정한 카테고리가 있다', async () => {
    await page.goto('/sales/details');
  });

  await test.step('When: 카테고리 관리에서 해당 카테고리를 삭제하고 확인 모달에서 확정한다', async () => {
    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page
      .getByRole('button', { name: `${RENAMED} 카테고리 삭제` })
      .click();
    await page
      .getByRole('dialog', { name: '정말 삭제하시겠어요?' })
      .getByRole('button', { name: '삭제' })
      .click();
  });

  await test.step('Then: 삭제 성공 안내가 표시된다', async () => {
    await expect(page.getByText('카테고리를 삭제했어요.')).toBeVisible();
  });

  await test.step('When: 관리 화면을 닫았다가 다시 연다', async () => {
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toBeHidden();
    await page.getByRole('button', { name: '카테고리 관리' }).click();
  });

  await test.step('Then: 해당 카테고리가 목록에서 사라진 상태로 유지된다', async () => {
    await expect(page.getByLabel(`${RENAMED} 카테고리 이름`)).toBeHidden();
  });
});
