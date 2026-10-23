import { getSalesCategories } from '@lib/api/entities/sales-category/api';

export const salesCategoryKeys = {
  all: ['salesCategory'] as const,
  list: () => [...salesCategoryKeys.all, 'list'] as const,
};

export const salesCategoryListQueryOptions = (options?: RequestInit) => ({
  queryKey: salesCategoryKeys.list(),
  queryFn: () => getSalesCategories(options),
  staleTime: 60_000,
});
