'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';

import { deleteSalesCategory } from '@lib/api/entities/sales-category/api';
import type { SalesCategory } from '@lib/api/entities/sales-category/toSalesCategory';

import { salesCategoryKeys } from './salesCategoryQueryOptions';

export const useDeleteSalesCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: number) => deleteSalesCategory(categoryId),
    // NOTE: 삭제한 카테고리는 매출 목록의 sales에서 빠지므로 매출 조회도 갱신한다
    onSuccess: (_, categoryId) => {
      queryClient.setQueryData<SalesCategory[]>(
        salesCategoryKeys.list(),
        (categories) => categories?.filter(({ id }) => id !== categoryId),
      );
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: salesCategoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: salesKeys.all }),
      ]);
    },
  });
};
