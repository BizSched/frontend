import {
  type APIRequest,
  type APIRequestContext,
  type APIResponse,
  expect,
  type PlaywrightTestOptions,
} from '@playwright/test';

import type {
  ScheduleCreateRequest,
  StaffCreateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';

// NOTE: BFF가 상태를 바꾸는 요청의 Origin을 검사하므로 브라우저와 같은 Origin을 붙인다.
const createPartTimeApi = (
  request: APIRequest,
  {
    baseURL,
    storageState,
  }: Partial<Pick<PlaywrightTestOptions, 'baseURL' | 'storageState'>>,
) => {
  if (!baseURL) throw new Error('Playwright 설정에 baseURL이 없습니다.');

  return request.newContext({
    baseURL,
    storageState,
    extraHTTPHeaders: { Origin: new URL(baseURL).origin },
  });
};

const expectOk = async (response: APIResponse) => {
  expect(response.ok(), await response.text()).toBe(true);
};

const getStaffTotalCount = async (api: APIRequestContext) => {
  const response = await api.get('/api/staff', {
    params: { page: 1, size: 1 },
  });
  await expectOk(response);
  return ((await response.json()) as { totalCount: number }).totalCount;
};

const createStaff = async (
  api: APIRequestContext,
  body: StaffCreateRequest,
) => {
  const response = await api.post('/api/staff', { data: body });
  await expectOk(response);
  return ((await response.json()) as { id: number }).id;
};

const deleteStaff = async (api: APIRequestContext, staffId: number) => {
  const response = await api.delete(`/api/staff/${staffId}`);
  if (response.status() !== 404) await expectOk(response);
};

const createSchedule = async (
  api: APIRequestContext,
  body: ScheduleCreateRequest,
) => {
  const response = await api.post('/api/schedules', { data: body });
  await expectOk(response);
  return ((await response.json()) as { id: number }).id;
};

const deleteStaffSchedules = async (
  api: APIRequestContext,
  staffId: number,
  range: { from: string; to: string },
) => {
  const response = await api.get('/api/schedules', {
    params: { ...range, staffId, page: 1, size: 100 },
  });
  await expectOk(response);
  const { items } = (await response.json()) as { items: { id: number }[] };
  for (const { id } of items) {
    const deleteResponse = await api.delete(`/api/schedules/${id}`);
    if (deleteResponse.status() !== 404) await expectOk(deleteResponse);
  }
};

export {
  createPartTimeApi,
  createSchedule,
  createStaff,
  deleteStaff,
  deleteStaffSchedules,
  getStaffTotalCount,
};
