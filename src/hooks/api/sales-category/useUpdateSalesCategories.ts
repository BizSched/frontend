'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';

import { updateSalesCategories } from '@lib/api/entities/sales-category/api';
import type { SalesCategoryItemRequest } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesCategoryKeys } from './salesCategoryQueryOptions';

export const useUpdateSalesCategories = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categories: SalesCategoryItemRequest[]) =>
      updateSalesCategories(categories),
    // NOTE: 이름 변경은 과거 매출 내역의 카테고리명에도 반영되므로 매출 조회도 갱신한다
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: salesCategoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: salesKeys.all }),
      ]),
  });
};
