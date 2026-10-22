import {
  type APIRequestContext,
  expect,
  type Page,
  test,
} from '@playwright/test';

import {
  formatCalendarDate,
  formatCalendarMonthLabel,
  shiftCalendarMonth,
} from '@lib/utilities/calendar/calendarDate';
import { getPartTimeScheduleRange } from '@lib/utilities/partTime/partTimeSchedule';

import {
  createPartTimeApi,
  createSchedule,
  createStaff,
  deleteStaff,
  deleteStaffSchedules,
} from './partTimeApi';

// NOTE: 스케줄 추가·수정·삭제 시나리오가 앞 시나리오의 결과에 의존하므로 순서대로 실행한다.
test.describe.configure({ mode: 'serial' });

// NOTE: 브라우저 프로젝트마다 이름이 겹치지 않도록 실행마다 다른 접미사를 붙인다.
const RUN_ID = Date.now().toString().slice(-6);
const STAFF_A = `E2E스케줄가${RUN_ID}`;
const STAFF_B = `E2E스케줄나${RUN_ID}`;
const SHORT_MEMO = 'E2E 짧은 메모';
const LONG_MEMO = ['E2E 긴 메모 첫째 줄', '둘째 줄', '셋째 줄', '넷째 줄'].join(
  '\n',
);

// NOTE: 서비스와 같은 한국 시간 기준으로 날짜를 정한다.
const dayKey = formatCalendarDate(new Date());
const monthKey = dayKey.slice(0, 7);
const day = Number(dayKey.slice(8));
const otherDay = day === 1 ? 2 : 1;
const otherDayKey = `${monthKey}-${String(otherDay).padStart(2, '0')}`;
const month = Number(monthKey.slice(5));

let api: APIRequestContext;
let staffAId: number | undefined;
let staffBId: number | undefined;

// NOTE: 날짜 버튼의 접근성 이름은 `2026년 10월 1일 목요일` 형식이다.
const getDateButtonName = (date: string) => {
  const [dateYear, dateMonth, dateDay] = date.split('-').map(Number);
  return new RegExp(`${dateYear}년 ${dateMonth}월 ${dateDay}일`);
};

// NOTE: 셀 가운데는 스케줄 칩이 덮고 있어 사용자가 누르는 날짜 숫자를 클릭한다.
const selectCalendarDate = (page: Page, date: string) =>
  page
    .getByRole('region', { name: '아르바이트생 스케줄 캘린더' })
    .getByRole('button', { name: getDateButtonName(date) })
    .getByText(String(Number(date.slice(8))), { exact: true })
    .click();

const getTodaySummary = (page: Page) =>
  page.getByRole('region', { name: '오늘의 스케줄' });

const getScheduleRow = (page: Page, text: string) =>
  page.getByRole('listitem').filter({ hasText: text });

const selectFormOption = async (page: Page, field: RegExp, option: string) => {
  await page
    .getByRole('dialog')
    .getByRole('group', { name: field })
    .getByRole('button')
    .click();
  await page.getByRole('menuitem', { name: option, exact: true }).click();
};

test.beforeAll(async ({ playwright }, testInfo) => {
  api = await createPartTimeApi(playwright.request, testInfo.project.use);
  staffAId = await createStaff(api, { name: STAFF_A });
  staffBId = await createStaff(api, { name: STAFF_B });
  await createSchedule(api, {
    staffId: staffAId,
    workDate: otherDayKey,
    startTime: '10:00',
    endTime: '12:00',
  });
  await createSchedule(api, {
    staffId: staffAId,
    workDate: dayKey,
    startTime: '09:00',
    endTime: '13:00',
    memo: LONG_MEMO,
  });
  await createSchedule(api, {
    staffId: staffBId,
    workDate: dayKey,
    startTime: '14:00',
    endTime: '18:00',
    memo: SHORT_MEMO,
  });
});

test.afterAll(async () => {
  if (!api) return;

  const range = getPartTimeScheduleRange(monthKey);
  for (const staffId of [staffAId, staffBId]) {
    if (staffId === undefined) continue;
    await deleteStaffSchedules(api, staffId, range);
    await deleteStaff(api, staffId);
  }
  await api.dispose();
});

test.describe('아르바이트생 스케줄 관리', () => {
  test('사용자는 이전 달, 다음 달로 캘린더를 이동할 수 있다.', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', {
      name: '아르바이트생 스케줄 캘린더',
    });
    // NOTE: react-day-picker의 숨은 caption에도 같은 문구가 있어 헤더의 월 제목만 찾는다.
    const monthTitle = calendar.getByRole('paragraph').first();

    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
      await expect(monthTitle).toHaveText(formatCalendarMonthLabel(monthKey));
    });

    await test.step('When 1: 이전 달 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: '이전 달' }).click();
    });

    await test.step('Then 1: 캘린더 제목이 지난달로 바뀐다', async () => {
      await expect(monthTitle).toHaveText(
        formatCalendarMonthLabel(shiftCalendarMonth(monthKey, -1)),
      );
    });

    await test.step('When 2: 다음 달 버튼을 두 번 클릭한다', async () => {
      await page.getByRole('button', { name: '다음 달' }).click();
      await page.getByRole('button', { name: '다음 달' }).click();
    });

    await test.step('Then 2: 캘린더 제목이 다음 달로 바뀐다', async () => {
      await expect(monthTitle).toHaveText(
        formatCalendarMonthLabel(shiftCalendarMonth(monthKey, 1)),
      );
    });
  });

  test('사용자는 날짜를 선택해 그날의 스케줄 상세를 볼 수 있다.', async ({
    page,
  }) => {
    const summary = page.getByRole('region', {
      name: `${month}월 ${otherDay}일 스케줄`,
    });

    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
    });

    await test.step('When: 캘린더에서 스케줄이 있는 날짜를 클릭한다', async () => {
      await selectCalendarDate(page, otherDayKey);
    });

    await test.step('Then: 날짜 상세 제목이 바뀌고 그날의 스케줄이 목록에 표시된다', async () => {
      await expect(summary).toBeVisible();
      await expect(summary.getByText(`10:00 ~ 12:00 ${STAFF_A}`)).toBeVisible();
      await expect(
        summary.getByRole('button', {
          name: `10:00 ~ 12:00 ${STAFF_A} 스케줄 수정`,
        }),
      ).toBeVisible();
      await expect(
        summary.getByRole('button', {
          name: `10:00 ~ 12:00 ${STAFF_A} 스케줄 삭제`,
        }),
      ).toBeVisible();
    });
  });

  test('사용자는 아르바이트생별로 스케줄을 걸러 볼 수 있다.', async ({
    page,
  }) => {
    const calendar = page.getByRole('region', {
      name: '아르바이트생 스케줄 캘린더',
    });
    const summary = getTodaySummary(page);

    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
      await expect(summary.getByText(STAFF_B)).toBeVisible();
    });

    await test.step('When: 아르바이트생 전체 스케줄 필터를 클릭하고 아르바이트생 한 명을 선택한다', async () => {
      await page
        .getByRole('button', {
          name: '스케줄 필터: 아르바이트생 전체 스케줄',
        })
        .click();
      await page.getByRole('menuitem', { name: STAFF_A, exact: true }).click();
    });

    await test.step('Then: 필터에 선택한 이름이 표시되고 그 아르바이트생의 스케줄만 표시된다', async () => {
      await expect(
        page.getByRole('button', { name: `스케줄 필터: ${STAFF_A}` }),
      ).toBeVisible();
      await expect(calendar.getByText(STAFF_A).first()).toBeVisible();
      await expect(calendar.getByText(STAFF_B)).toHaveCount(0);
      await expect(summary.getByText(STAFF_A)).toBeVisible();
      await expect(summary.getByText(STAFF_B)).toHaveCount(0);
      for (const row of await summary.getByRole('listitem').all()) {
        await expect(row).toContainText(STAFF_A);
      }
    });
  });

  test('사용자는 스케줄을 추가할 수 있다.', async ({ page }) => {
    const dialog = page.getByRole('dialog', {
      name: '아르바이트생 스케줄 추가',
    });
    const summary = getTodaySummary(page);

    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
    });

    await test.step('When: 아르바이트생, 근무 날짜, 근무 시간을 선택하고 생성 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: '스케줄 추가' }).click();
      await selectFormOption(page, /^아르바이트생 이름/, STAFF_A);

      await dialog
        .getByRole('button', { name: '근무 날짜를 선택해주세요' })
        .click();
      // NOTE: 날짜 선택 팝업은 모달 밖에 portal로 렌더링되어 확인 버튼이 있는 dialog로 찾는다.
      const datePicker = page.getByRole('dialog').filter({
        has: page.getByRole('button', { name: '확인', exact: true }),
      });
      await datePicker
        .getByRole('button', { name: getDateButtonName(dayKey) })
        .click();
      await datePicker
        .getByRole('button', { name: '확인', exact: true })
        .click();

      await selectFormOption(page, /^근무 시작 시간/, '19:00');
      await selectFormOption(page, /^근무 마감 시간/, '21:00');
      await dialog.getByRole('button', { name: '생성' }).click();
    });

    await test.step('Then: 모달이 닫히고 선택한 날짜의 상세에 추가한 스케줄이 표시된다', async () => {
      await expect(dialog).toBeHidden();
      await expect(summary.getByText(`19:00 ~ 21:00 ${STAFF_A}`)).toBeVisible();
      await expect(
        summary.getByRole('button', {
          name: `19:00 ~ 21:00 ${STAFF_A} 스케줄 수정`,
        }),
      ).toBeVisible();
      await expect(
        summary.getByRole('button', {
          name: `19:00 ~ 21:00 ${STAFF_A} 스케줄 삭제`,
        }),
      ).toBeVisible();
    });
  });

  test('사용자는 빠른 선택(오전, 오후, 저녁)으로 근무 시간을 채울 수 있다.', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog', {
      name: '아르바이트생 스케줄 추가',
    });
    const startTime = dialog
      .getByRole('group', { name: /^근무 시작 시간/ })
      .getByRole('button');
    const endTime = dialog
      .getByRole('group', { name: /^근무 마감 시간/ })
      .getByRole('button');

    await test.step('Given: 로그인한 상태에서 스케줄 추가 모달을 연다', async () => {
      await page.goto('/partTime/schedule');
      await page.getByRole('button', { name: '스케줄 추가' }).click();
    });

    await test.step('When 1: 오전 버튼을 클릭한다', async () => {
      await dialog
        .getByRole('button', { name: '오전 (09:00 ~ 13:00)' })
        .click();
    });

    await test.step('Then 1: 근무 시작 시간이 09:00, 마감 시간이 13:00으로 채워진다', async () => {
      await expect(startTime).toHaveText('09:00');
      await expect(endTime).toHaveText('13:00');
    });

    await test.step('When 2: 저녁 버튼을 클릭한다', async () => {
      await dialog
        .getByRole('button', { name: '저녁 (18:00 ~ 22:00)' })
        .click();
    });

    await test.step('Then 2: 근무 시작 시간이 18:00, 마감 시간이 22:00으로 바뀐다', async () => {
      await expect(startTime).toHaveText('18:00');
      await expect(endTime).toHaveText('22:00');
    });
  });

  test('사용자는 날짜 상세에서 스케줄 메모를 확인할 수 있다.', async ({
    page,
  }) => {
    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
    });

    await test.step('When: 캘린더에서 메모가 있는 스케줄의 날짜를 클릭한다', async () => {
      await selectCalendarDate(page, dayKey);
    });

    await test.step('Then: 날짜 상세의 해당 스케줄 아래에 메모가 표시된다', async () => {
      await expect(
        getScheduleRow(page, `14:00 ~ 18:00 ${STAFF_B}`).getByText(SHORT_MEMO),
      ).toBeVisible();
    });
  });

  test('사용자는 긴 메모를 펼치거나 접을 수 있다.', async ({ page }) => {
    const row = getScheduleRow(page, `09:00 ~ 13:00 ${STAFF_A}`);
    const memo = row.locator('p', { hasText: 'E2E 긴 메모 첫째 줄' });
    let collapsedHeight = 0;

    await test.step('Given: 로그인한 상태에서 2줄을 넘는 메모가 있는 스케줄의 날짜를 선택한다', async () => {
      await page.goto('/partTime/schedule');
      await expect(
        row.getByRole('button', { name: '메모 펼치기' }),
      ).toBeVisible();
      collapsedHeight = (await memo.boundingBox())?.height ?? 0;
    });

    await test.step('When 1: 메모 펼치기 버튼을 클릭한다', async () => {
      await row.getByRole('button', { name: '메모 펼치기' }).click();
    });

    await test.step('Then 1: 메모 전체가 표시된다', async () => {
      await expect(
        row.getByRole('button', { name: '메모 접기' }),
      ).toHaveAttribute('aria-expanded', 'true');
      await expect
        .poll(async () => (await memo.boundingBox())?.height)
        .toBeGreaterThan(collapsedHeight);
    });

    await test.step('When 2: 메모 접기 버튼을 클릭한다', async () => {
      await row.getByRole('button', { name: '메모 접기' }).click();
    });

    await test.step('Then 2: 다시 2줄까지만 표시된다', async () => {
      await expect(
        row.getByRole('button', { name: '메모 펼치기' }),
      ).toHaveAttribute('aria-expanded', 'false');
      await expect
        .poll(async () => (await memo.boundingBox())?.height)
        .toBe(collapsedHeight);
    });
  });

  test('사용자는 출근 확인을 체크하거나 해제할 수 있다.', async ({ page }) => {
    const summary = getTodaySummary(page);
    const progress = summary.getByText(/^\d+\/\d+ 완료$/);
    const checkbox = summary.getByRole('checkbox', {
      name: `14:00 ~ 18:00 ${STAFF_B}`,
    });
    let checkedCount = 0;
    let totalCount = 0;

    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
      await expect(checkbox).not.toBeChecked();
      [checkedCount, totalCount] = ((await progress.textContent()) ?? '')
        .match(/\d+/g)!
        .map(Number);
    });

    await test.step('When 1: 오늘의 스케줄에서 스케줄의 체크박스를 클릭한다', async () => {
      await checkbox.click();
    });

    await test.step('Then 1: 체크박스가 체크되고 완료 수가 1 늘어난다', async () => {
      await expect(checkbox).toBeChecked();
      await expect(progress).toHaveText(
        `${checkedCount + 1}/${totalCount} 완료`,
      );
    });

    await test.step('When 2: 같은 체크박스를 다시 클릭한다', async () => {
      await checkbox.click();
    });

    await test.step('Then 2: 체크가 풀리고 완료 수가 원래대로 돌아간다', async () => {
      await expect(checkbox).not.toBeChecked();
      await expect(progress).toHaveText(`${checkedCount}/${totalCount} 완료`);
    });
  });

  test('사용자는 스케줄을 수정할 수 있다.', async ({ page }) => {
    const dialog = page.getByRole('dialog', {
      name: '아르바이트생 스케줄 수정',
    });
    const summary = getTodaySummary(page);

    await test.step('Given: 추가한 스케줄의 날짜를 선택한다', async () => {
      await page.goto('/partTime/schedule');
    });

    await test.step('When: 수정 버튼을 클릭해 근무 시간을 바꾸고 수정 완료 버튼을 클릭한다', async () => {
      await summary
        .getByRole('button', { name: `19:00 ~ 21:00 ${STAFF_A} 스케줄 수정` })
        .click();
      await selectFormOption(page, /^근무 시작 시간/, '20:00');
      await selectFormOption(page, /^근무 마감 시간/, '22:00');
      await dialog.getByRole('button', { name: '수정 완료' }).click();
    });

    await test.step('Then: 모달이 닫히고 날짜 상세에 바뀐 근무 시간이 표시된다', async () => {
      await expect(dialog).toBeHidden();
      await expect(summary.getByText(`20:00 ~ 22:00 ${STAFF_A}`)).toBeVisible();
      await expect(summary.getByText(`19:00 ~ 21:00 ${STAFF_A}`)).toBeHidden();
    });
  });

  test('사용자는 스케줄을 삭제할 수 있다.', async ({ page }) => {
    const dialog = page.getByRole('dialog', {
      name: '스케줄을 삭제하시겠어요?',
    });
    const summary = getTodaySummary(page);

    await test.step('Given: 수정한 스케줄의 날짜를 선택한다', async () => {
      await page.goto('/partTime/schedule');
    });

    await test.step('When: 삭제 버튼을 클릭하고 확인 모달에서 삭제 버튼을 클릭한다', async () => {
      await summary
        .getByRole('button', { name: `20:00 ~ 22:00 ${STAFF_A} 스케줄 삭제` })
        .click();
      await dialog.getByRole('button', { name: '삭제' }).click();
    });

    await test.step('Then: 모달이 닫히고 날짜 상세에서 해당 스케줄이 사라진다', async () => {
      await expect(dialog).toBeHidden();
      await expect(summary.getByText(`20:00 ~ 22:00 ${STAFF_A}`)).toBeHidden();
    });
  });

  test('사용자는 스케줄 추가, 수정 모달을 취소하거나 닫을 수 있다.', async ({
    page,
  }) => {
    const dialog = page.getByRole('dialog', {
      name: '아르바이트생 스케줄 추가',
    });
    const staffField = dialog
      .getByRole('group', { name: /^아르바이트생 이름/ })
      .getByRole('button');
    const editDialog = page.getByRole('dialog', {
      name: '아르바이트생 스케줄 수정',
    });
    const editStartTime = editDialog
      .getByRole('group', { name: /^근무 시작 시간/ })
      .getByRole('button');
    const summary = getTodaySummary(page);
    const editButton = summary.getByRole('button', {
      name: `09:00 ~ 13:00 ${STAFF_A} 스케줄 수정`,
    });
    let rowCount = 0;

    await test.step('Given: 로그인한 상태에서 아르바이트생 스케줄 관리 페이지에 접근한다', async () => {
      await page.goto('/partTime/schedule');
      await expect(summary.getByText(STAFF_B)).toBeVisible();
      rowCount = await summary.getByRole('listitem').count();
    });

    await test.step('When 1: 스케줄 추가 모달에서 아르바이트생을 선택한 뒤 취소 버튼을 클릭한다', async () => {
      await page.getByRole('button', { name: '스케줄 추가' }).click();
      await selectFormOption(page, /^아르바이트생 이름/, STAFF_A);
      await expect(staffField).toHaveText(STAFF_A);
      await dialog.getByRole('button', { name: '취소' }).click();
    });

    await test.step('Then 1: 모달이 닫히고 스케줄이 추가되지 않으며, 다시 열면 입력값이 비어 있다', async () => {
      await expect(dialog).toBeHidden();
      await expect(summary.getByRole('listitem')).toHaveCount(rowCount);
      await page.getByRole('button', { name: '스케줄 추가' }).click();
      await expect(staffField).toHaveText('아르바이트생을 선택해주세요');
    });

    await test.step('When 2: 아르바이트생을 선택한 뒤 닫기(X) 버튼을 클릭한다', async () => {
      await selectFormOption(page, /^아르바이트생 이름/, STAFF_A);
      await dialog.getByRole('button', { name: '닫기' }).click();
    });

    await test.step('Then 2: 모달이 닫히고 스케줄이 추가되지 않으며, 다시 열면 입력값이 비어 있다', async () => {
      await expect(dialog).toBeHidden();
      await expect(summary.getByRole('listitem')).toHaveCount(rowCount);
      await page.getByRole('button', { name: '스케줄 추가' }).click();
      await expect(staffField).toHaveText('아르바이트생을 선택해주세요');
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    });

    await test.step('When 3: 스케줄 수정 모달에서 근무 시작 시간을 바꾼 뒤 취소 버튼을 클릭한다', async () => {
      await editButton.click();
      await selectFormOption(page, /^근무 시작 시간/, '10:00');
      await expect(editStartTime).toHaveText('10:00');
      await editDialog.getByRole('button', { name: '취소' }).click();
    });

    await test.step('Then 3: 모달이 닫히고 스케줄이 바뀌지 않으며, 다시 열면 원래 값이 표시된다', async () => {
      await expect(editDialog).toBeHidden();
      await expect(summary.getByText(`09:00 ~ 13:00 ${STAFF_A}`)).toBeVisible();
      await editButton.click();
      await expect(editStartTime).toHaveText('09:00');
    });

    await test.step('When 4: 근무 시작 시간을 바꾼 뒤 닫기(X) 버튼을 클릭한다', async () => {
      await selectFormOption(page, /^근무 시작 시간/, '10:00');
      await editDialog.getByRole('button', { name: '닫기' }).click();
    });

    await test.step('Then 4: 모달이 닫히고 스케줄이 바뀌지 않으며, 다시 열면 원래 값이 표시된다', async () => {
      await expect(editDialog).toBeHidden();
      await expect(summary.getByText(`09:00 ~ 13:00 ${STAFF_A}`)).toBeVisible();
      await editButton.click();
      await expect(editStartTime).toHaveText('09:00');
    });
  });
});
