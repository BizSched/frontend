import { getSalesList, getSalesMonthTotal } from '@lib/api/entities/sales/api';
import type {
  FindAll3Params,
  FindSummaryParams,
} from '@lib/api/generated/bizSchedAPI.schemas';

export const salesKeys = {
  all: ['sales'] as const,
  list: (params?: FindAll3Params) =>
    [...salesKeys.all, 'list', params] as const,
  monthTotal: (params?: FindSummaryParams) =>
    [...salesKeys.all, 'monthTotal', params] as const,
};

export const salesListQueryOptions = (
  params?: FindAll3Params,
  options?: RequestInit,
) => ({
  queryKey: salesKeys.list(params),
  queryFn: () => getSalesList(params, options),
  staleTime: 60_000,
});

export const salesMonthTotalQueryOptions = (
  params?: FindSummaryParams,
  options?: RequestInit,
) => ({
  queryKey: salesKeys.monthTotal(params),
  queryFn: () => getSalesMonthTotal(params, options),
  staleTime: 60_000,
});
