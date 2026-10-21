import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import { staffKeys } from '@hooks/api/staff/staffQueryOptions';
import { useDeleteStaff } from '@hooks/api/staff/useDeleteStaff';

import { ApiError } from '@lib/api/apiError';
import { deleteStaff } from '@lib/api/entities/staff/api';

vi.mock('@lib/api/entities/staff/api', () => ({
  deleteStaff: vi.fn(),
}));

const keys = [
  staffKeys.list({ page: 1, size: 10 }),
  staffKeys.list({ page: 2, size: 10 }),
  staffKeys.options(),
  staffKeys.options('EMPLOYED'),
  staffKeys.detail(42),
  scheduleKeys.list({ from: '2026-09-28', to: '2026-11-01' }),
  scheduleKeys.list({ from: '2026-09-28', to: '2026-11-01', staffId: 42 }),
  scheduleKeys.list({ from: '2026-10-12', to: '2026-10-18', staffId: 42 }),
];
const clients: QueryClient[] = [];
const setup = () => {
  const client = new QueryClient();
  clients.push(client);
  keys.forEach((key) => client.setQueryData(key, []));
  client.setQueryData(staffKeys.detail(99), { id: 99 });

  const hook = renderHook(() => useDeleteStaff(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client };
};

beforeEach(() => vi.resetAllMocks());
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

describe('useDeleteStaff', () => {
  it('삭제 전 조회의 늦은 응답이나 연속 삭제로 제거된 직원이 다시 나타나지 않는다', async () => {
    const client = new QueryClient();
    clients.push(client);
    const listKey = staffKeys.list({ page: 1, size: 10 });
    const items = [{ id: 42 }, { id: 99 }, { id: 100 }];
    const list = { page: 1, size: 10, totalCount: 3, totalPage: 1, items };
    client.setQueryData(listKey, list);
    let resolveOldList!: (value: typeof list) => void;
    const fetchList = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOldList = resolve;
          }),
      )
      .mockImplementation(() => new Promise(() => {}));
    vi.mocked(deleteStaff).mockImplementation(async (staffId) => staffId);
    const { result } = renderHook(
      () => {
        useQuery({ queryKey: listKey, queryFn: fetchList });
        return useDeleteStaff();
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      },
    );
    await waitFor(() => expect(fetchList).toHaveBeenCalledTimes(1));

    act(() => result.current.mutate(42));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    await act(async () => resolveOldList(list));
    expect(client.getQueryData(listKey)).toEqual({
      ...list,
      items: [{ id: 99 }, { id: 100 }],
    });

    act(() => result.current.mutate(99));
    await waitFor(() => expect(result.current.data).toBe(99));
    expect(client.getQueryData(listKey)).toEqual({
      ...list,
      items: [{ id: 100 }],
    });
  });

  it('재조회가 지연되어도 삭제를 완료하고 목록·옵션에서 삭제한 직원을 먼저 제거한다', async () => {
    const client = new QueryClient();
    clients.push(client);
    const listKey = staffKeys.list({ page: 1, size: 10 });
    const items = [
      { id: 42, name: '삭제 대상' },
      { id: 99, name: '다른 직원' },
    ];
    const list = { page: 1, size: 10, totalCount: 2, totalPage: 1, items };
    client.setQueryData(listKey, list);
    client.setQueryData(staffKeys.options(), items);
    client.setQueryData(staffKeys.options('EMPLOYED'), items);
    const fetchList = vi.fn(() => new Promise(() => {}));
    const fetchSchedule = vi.fn(() => new Promise(() => {}));
    vi.mocked(deleteStaff).mockResolvedValue(42);
    const { result } = renderHook(
      () => {
        useQuery({
          queryKey: listKey,
          queryFn: fetchList,
          staleTime: Infinity,
        });
        useQuery({
          queryKey: scheduleKeys.list({
            from: '2026-10-12',
            to: '2026-10-18',
            staffId: 99,
          }),
          queryFn: fetchSchedule,
          initialData: [],
          staleTime: Infinity,
        });
        return useDeleteStaff();
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={client}>{children}</QueryClientProvider>
        ),
      },
    );

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fetchList).toHaveBeenCalledTimes(1);
    expect(fetchSchedule).toHaveBeenCalledTimes(1);
    expect(client.isFetching()).toBe(2);
    expect(client.getQueryData(listKey)).toEqual({
      ...list,
      items: [items[1]],
    });
    expect(client.getQueryData(staffKeys.options())).toEqual([items[1]]);
    expect(client.getQueryData(staffKeys.options('EMPLOYED'))).toEqual([
      items[1],
    ]);
  });

  it('삭제 후 목록·옵션·해당 상세·모든 스케줄을 무효화한다', async () => {
    vi.mocked(deleteStaff).mockResolvedValue(42);
    const { result, client } = setup();

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    keys.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
    expect(client.getQueryState(staffKeys.detail(99))?.isInvalidated).toBe(
      false,
    );
  });

  it('STAFF_NOT_FOUND이면 이미 삭제된 직원이 사라지도록 목록과 해당 상세만 무효화한다', async () => {
    vi.mocked(deleteStaff).mockRejectedValue(
      new ApiError('STAFF_NOT_FOUND', 404, '아르바이트생을 찾을 수 없어요.'),
    );
    const { result, client } = setup();

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isError).toBe(true));
    [
      staffKeys.list({ page: 1, size: 10 }),
      staffKeys.list({ page: 2, size: 10 }),
      staffKeys.detail(42),
    ].forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
    expect(client.getQueryState(staffKeys.detail(99))?.isInvalidated).toBe(
      false,
    );
    expect(
      client.getQueryState(
        scheduleKeys.list({ from: '2026-09-28', to: '2026-11-01' }),
      )?.isInvalidated,
    ).toBe(false);
  });

  it('실패하면 기존 캐시를 유지하고 삭제를 재시도하지 않는다', async () => {
    const error = new Error('삭제 실패');
    vi.mocked(deleteStaff).mockRejectedValue(error);
    const { result, client } = setup();

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(deleteStaff).toHaveBeenCalledTimes(1);
    keys.forEach((key) => {
      expect(client.getQueryState(key)?.isInvalidated).toBe(false);
      expect(client.getQueryData(key)).toEqual([]);
    });
  });
});
