import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import { useDeleteSchedule } from '@hooks/api/schedule/useDeleteSchedule';

import { deleteSchedule } from '@lib/api/entities/schedule/api';

vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(),
  deleteSchedule: vi.fn(),
}));

const variables = 10;
const keys = [
  scheduleKeys.list({ from: '2026-09-28', to: '2026-11-01' }),
  scheduleKeys.list({ from: '2026-09-28', to: '2026-11-01', staffId: 7 }),
  scheduleKeys.list({ from: '2026-10-12', to: '2026-10-18', staffId: 7 }),
];
const clients: QueryClient[] = [];
const setup = () => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  clients.push(client);
  keys.forEach((key) => client.setQueryData(key, []));
  client.setQueryData(['staff', 'list'], []);
  const hook = renderHook(() => useDeleteSchedule(), {
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

describe('useDeleteSchedule', () => {
  it('성공하면 월·필터·이번 주 근무 쿼리를 함께 무효화한다', async () => {
    vi.mocked(deleteSchedule).mockResolvedValue(10);
    const { result, client } = setup();

    act(() => result.current.mutate(variables));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteSchedule).toHaveBeenCalledWith(10);
    keys.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
    expect(client.getQueryState(['staff', 'list'])?.isInvalidated).toBe(false);
  });

  it('실패하면 캐시를 유지하고 재시도하지 않는다', async () => {
    const error = new Error('요청 실패');
    vi.mocked(deleteSchedule).mockRejectedValue(error);
    const { result, client } = setup();

    act(() => result.current.mutate(variables));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
    expect(deleteSchedule).toHaveBeenCalledTimes(1);
    keys.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(false),
    );
  });
});
