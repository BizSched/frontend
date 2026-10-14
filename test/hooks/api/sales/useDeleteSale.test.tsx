import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';
import { useDeleteSale } from '@hooks/api/sales/useDeleteSale';

import { deleteSale } from '@lib/api/entities/sales/api';

vi.mock('@lib/api/entities/sales/api', () => ({
  createSale: vi.fn(),
  deleteSale: vi.fn(),
  getSalesList: vi.fn(),
  getSalesMonthTotal: vi.fn(),
  updateSale: vi.fn(),
}));

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderDeleteSale = (queryClient: QueryClient) =>
  renderHook(() => useDeleteSale(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

const listKey = salesKeys.list({ month: '2026-10' });
const monthTotalKey = salesKeys.monthTotal({ month: '2026-10' });
const categoryKey = ['salesCategory', 'list'] as const;

describe('useDeleteSale', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => cleanup());

  it('매출 삭제에 성공하면 매출 목록과 월 합계 쿼리를 무효화한다', async () => {
    vi.mocked(deleteSale).mockResolvedValue(undefined);
    const queryClient = createQueryClient();
    queryClient.setQueryData(listKey, { items: [] });
    queryClient.setQueryData(monthTotalKey, 0);
    queryClient.setQueryData(categoryKey, []);
    const { result } = renderDeleteSale(queryClient);

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteSale).toHaveBeenCalledWith(42);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(monthTotalKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(categoryKey)?.isInvalidated).toBe(false);
  });

  it('매출 삭제에 실패하면 오류를 mutation 상태에 보존한다', async () => {
    const error = new Error('매출 삭제 실패');
    vi.mocked(deleteSale).mockRejectedValue(error);
    const { result } = renderDeleteSale(createQueryClient());

    act(() => result.current.mutate(42));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
