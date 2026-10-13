import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';
import { useCreateSale } from '@hooks/api/sales/useCreateSale';

import { createSale } from '@lib/api/entities/sales/api';
import type { SaleCreateRequest } from '@lib/api/generated/bizSchedAPI.schemas';

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

const renderCreateSale = (queryClient: QueryClient) =>
  renderHook(() => useCreateSale(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

const request: SaleCreateRequest = {
  date: '2026-10-01',
  sales: [],
  totalAmount: 0,
};
const listKey = salesKeys.list({ month: '2026-10' });
const monthTotalKey = salesKeys.monthTotal({ month: '2026-10' });
const categoryKey = ['salesCategory', 'list'] as const;

describe('useCreateSale', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => cleanup());

  it('매출 생성에 성공하면 매출 목록과 월 합계 쿼리를 무효화한다', async () => {
    vi.mocked(createSale).mockResolvedValue({
      id: 1,
      date: request.date,
      sales: [],
      totalAmount: 0,
    });
    const queryClient = createQueryClient();
    queryClient.setQueryData(listKey, { items: [] });
    queryClient.setQueryData(monthTotalKey, 0);
    queryClient.setQueryData(categoryKey, []);
    const { result } = renderCreateSale(queryClient);

    act(() => result.current.mutate(request));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createSale).toHaveBeenCalledWith(request);
    expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(monthTotalKey)?.isInvalidated).toBe(true);
    expect(queryClient.getQueryState(categoryKey)?.isInvalidated).toBe(false);
  });

  it('매출 생성에 실패하면 오류를 mutation 상태에 보존한다', async () => {
    const error = new Error('매출 생성 실패');
    vi.mocked(createSale).mockRejectedValue(error);
    const { result } = renderCreateSale(createQueryClient());

    act(() => result.current.mutate(request));

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBe(error);
  });
});
