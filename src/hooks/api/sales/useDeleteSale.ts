'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteSale } from '@lib/api/entities/sales/api';

import { salesKeys } from './salesQueryOptions';

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (salesId: number) => deleteSale(salesId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: salesKeys.all });
    },
  });
};
