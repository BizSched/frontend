'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSalesCategory } from '@lib/api/entities/sales-category/api';

import { salesCategoryKeys } from './salesCategoryQueryOptions';

export const useCreateSalesCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createSalesCategory(name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: salesCategoryKeys.all }),
  });
};
