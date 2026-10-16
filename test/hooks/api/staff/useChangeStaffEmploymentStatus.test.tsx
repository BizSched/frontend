import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import { staffKeys } from '@hooks/api/staff/staffQueryOptions';
import { useChangeStaffEmploymentStatus } from '@hooks/api/staff/useChangeStaffEmploymentStatus';

import { ApiError } from '@lib/api/apiError';
import { changeStaffEmploymentStatus } from '@lib/api/entities/staff/api';

vi.mock('@lib/api/entities/staff/api', () => ({
  changeStaffEmploymentStatus: vi.fn(),
}));

const STAFF = {
  id: 42,
  name: '김알바',
  createdAt: '2026-10-14T09:00:00+09:00',
  employmentStatus: 'employed' as const,
};
const listKey = staffKeys.list({ page: 1, size: 10 });
const optionsKey = staffKeys.options('EMPLOYED');
const detailKey = staffKeys.detail(42);
const otherDetailKey = staffKeys.detail(99);
const scheduleKey = scheduleKeys.list({ from: '2026-10-12', to: '2026-10-18' });
const clients: QueryClient[] = [];

const setup = () => {
  const client = new QueryClient();
  clients.push(client);
  client.setQueryData(listKey, {
    page: 1,
    size: 10,
    totalCount: 2,
    totalPage: 1,
    items: [STAFF, { ...STAFF, id: 99, name: '다른 직원' }],
  });
  client.setQueryData(optionsKey, [
    { id: 42, name: '김알바', isDeleted: false },
  ]);
  client.setQueryData(detailKey, { ...STAFF, attachments: [] });
  client.setQueryData(otherDetailKey, { ...STAFF, id: 99, attachments: [] });
  client.setQueryData(scheduleKey, []);

  const hook = renderHook(() => useChangeStaffEmploymentStatus(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client };
};
const isInvalidated = (client: QueryClient, queryKey: readonly unknown[]) =>
  client.getQueryState(queryKey)?.isInvalidated;

beforeEach(() => vi.resetAllMocks());
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

describe('useChangeStaffEmploymentStatus', () => {
  it('성공하면 목록·상세의 상태를 바로 바꾸고 목록·상세·스케쥴을 무효화한다', async () => {
    vi.mocked(changeStaffEmploymentStatus).mockResolvedValue({
      id: 42,
      employmentStatus: 'resigned',
    });
    const { result, client } = setup();

    await act(() =>
      result.current.mutateAsync({ staffId: 42, employmentStatus: 'resigned' }),
    );

    expect(changeStaffEmploymentStatus).toHaveBeenCalledWith(42, 'resigned');
    expect(client.getQueryData(detailKey)).toMatchObject({
      employmentStatus: 'resigned',
    });
    expect(client.getQueryData(listKey)).toMatchObject({
      items: [
        { id: 42, employmentStatus: 'resigned' },
        { id: 99, employmentStatus: 'employed' },
      ],
    });
    expect(client.getQueryData(optionsKey)).toEqual([
      { id: 42, name: '김알바', isDeleted: false },
    ]);
    expect(isInvalidated(client, listKey)).toBe(true);
    expect(isInvalidated(client, optionsKey)).toBe(true);
    expect(isInvalidated(client, detailKey)).toBe(true);
    expect(isInvalidated(client, scheduleKey)).toBe(true);
    expect(isInvalidated(client, otherDetailKey)).toBe(false);
  });

  it('STAFF_NOT_FOUND이면 목록과 해당 상세만 무효화한다', async () => {
    vi.mocked(changeStaffEmploymentStatus).mockRejectedValue(
      new ApiError('STAFF_NOT_FOUND', 404, '아르바이트생을 찾을 수 없어요.'),
    );
    const { result, client } = setup();

    await act(() =>
      result.current
        .mutateAsync({ staffId: 42, employmentStatus: 'onLeave' })
        .catch(() => {}),
    );

    expect(isInvalidated(client, listKey)).toBe(true);
    expect(isInvalidated(client, detailKey)).toBe(true);
    expect(isInvalidated(client, scheduleKey)).toBe(false);
    expect(client.getQueryData(detailKey)).toMatchObject({
      employmentStatus: 'employed',
    });
  });

  it('그 밖의 실패는 캐시를 그대로 둔다', async () => {
    vi.mocked(changeStaffEmploymentStatus).mockRejectedValue(
      new ApiError('INVALID_REQUEST', 400),
    );
    const { result, client } = setup();

    await act(() =>
      result.current
        .mutateAsync({ staffId: 42, employmentStatus: 'onLeave' })
        .catch(() => {}),
    );

    expect(isInvalidated(client, listKey)).toBe(false);
    expect(isInvalidated(client, detailKey)).toBe(false);
    expect(isInvalidated(client, scheduleKey)).toBe(false);
  });
});
