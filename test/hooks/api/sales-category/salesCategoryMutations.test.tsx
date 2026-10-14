import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';
import { salesCategoryKeys } from '@hooks/api/sales-category/salesCategoryQueryOptions';
import { useCreateSalesCategory } from '@hooks/api/sales-category/useCreateSalesCategory';
import { useDeleteSalesCategory } from '@hooks/api/sales-category/useDeleteSalesCategory';
import { useUpdateSalesCategories } from '@hooks/api/sales-category/useUpdateSalesCategories';

import {
  createSalesCategory,
  deleteSalesCategory,
  updateSalesCategories,
} from '@lib/api/entities/sales-category/api';

vi.mock('@lib/api/entities/sales-category/api', () => ({
  createSalesCategory: vi.fn(),
  deleteSalesCategory: vi.fn(),
  getSalesCategories: vi.fn(),
  updateSalesCategories: vi.fn(),
}));

const salesListKey = salesKeys.list({ month: '2026-10' });

const renderWithClient = <T,>(useHook: () => T) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(salesCategoryKeys.list(), []);
  queryClient.setQueryData(salesListKey, { items: [] });
  const { result } = renderHook(useHook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });
  const isInvalidated = (queryKey: readonly unknown[]) =>
    queryClient.getQueryState(queryKey)?.isInvalidated;
  return { result, isInvalidated };
};

describe('sales category mutations', () => {
  beforeEach(() => vi.resetAllMocks());
  afterEach(() => cleanup());

  it('추가에 성공하면 카테고리 목록만 무효화한다', async () => {
    vi.mocked(createSalesCategory).mockResolvedValue({
      id: 1,
      name: '음료',
      color: '#F26B1D',
      order: 0,
    });
    const { result, isInvalidated } = renderWithClient(useCreateSalesCategory);

    act(() => result.current.mutate('음료'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(createSalesCategory).toHaveBeenCalledWith('음료');
    expect(isInvalidated(salesCategoryKeys.list())).toBe(true);
    expect(isInvalidated(salesListKey)).toBe(false);
  });

  it('삭제에 성공하면 카테고리 목록과 매출 조회를 무효화한다', async () => {
    vi.mocked(deleteSalesCategory).mockResolvedValue(undefined);
    const { result, isInvalidated } = renderWithClient(useDeleteSalesCategory);

    act(() => result.current.mutate(1));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteSalesCategory).toHaveBeenCalledWith(1);
    expect(isInvalidated(salesCategoryKeys.list())).toBe(true);
    expect(isInvalidated(salesListKey)).toBe(true);
  });

  it('이름 수정에 성공하면 카테고리 목록과 매출 조회를 무효화한다', async () => {
    const categories = [{ id: 1, name: '음료', order: 0 }];
    vi.mocked(updateSalesCategories).mockResolvedValue([]);
    const { result, isInvalidated } = renderWithClient(
      useUpdateSalesCategories,
    );

    act(() => result.current.mutate(categories));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(updateSalesCategories).toHaveBeenCalledWith(categories);
    expect(isInvalidated(salesCategoryKeys.list())).toBe(true);
    expect(isInvalidated(salesListKey)).toBe(true);
  });

  it('실패하면 오류를 mutation 상태에 보존한다', async () => {
    const error = new Error('카테고리 추가 실패');
    vi.mocked(createSalesCategory).mockRejectedValue(error);
    const { result } = renderWithClient(useCreateSalesCategory);

    act(() => result.current.mutate('음료'));

    await waitFor(() => expect(result.current.error).toBe(error));
  });
});
