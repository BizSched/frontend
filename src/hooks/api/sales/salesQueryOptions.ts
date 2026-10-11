import { getSalesList } from '@lib/api/entities/sales/api';
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

export const salesListQueryOptions = (params?: FindAll3Params) => ({
  queryKey: salesKeys.list(params),
  queryFn: () => getSalesList(params),
});
