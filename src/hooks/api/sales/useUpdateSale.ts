'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateSale } from '@lib/api/entities/sales/api';
import type { SaleUpdateRequest } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesKeys } from './salesQueryOptions';

export const useUpdateSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      salesId,
      body,
    }: {
      salesId: number;
      body: SaleUpdateRequest;
    }) => updateSale(salesId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
};
