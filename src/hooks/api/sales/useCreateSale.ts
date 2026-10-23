'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSale } from '@lib/api/entities/sales/api';
import type { SaleCreateRequest } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesKeys } from './salesQueryOptions';

export const useCreateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: SaleCreateRequest) => createSale(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
};
