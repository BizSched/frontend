import {
  getSalesChart,
  getSalesList,
  getSalesMonthTotal,
  getSalesRatio,
  getSalesSummary,
} from '@lib/api/entities/sales/api';
import type {
  FindAll3Params,
  FindChartParams,
  FindRatioParams,
  FindSummaryParams,
} from '@lib/api/generated/bizSchedAPI.schemas';

export const salesKeys = {
  all: ['sales'] as const,
  list: (params?: FindAll3Params) =>
    [...salesKeys.all, 'list', params] as const,
  monthTotal: (params?: FindSummaryParams) =>
    [...salesKeys.all, 'monthTotal', params] as const,
  summary: (params?: FindSummaryParams) =>
    [...salesKeys.all, 'summary', params] as const,
  chart: (params: FindChartParams) =>
    [...salesKeys.all, 'chart', params] as const,
  ratio: (params?: FindRatioParams) =>
    [...salesKeys.all, 'ratio', params] as const,
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

export const salesSummaryQueryOptions = (
  params?: FindSummaryParams,
  options?: RequestInit,
) => ({
  queryKey: salesKeys.summary(params),
  queryFn: () => getSalesSummary(params, options),
  staleTime: 60_000,
});

export const salesChartQueryOptions = (
  params: FindChartParams,
  options?: RequestInit,
) => ({
  queryKey: salesKeys.chart(params),
  queryFn: () => getSalesChart(params, options),
  staleTime: 60_000,
});

export const salesRatioQueryOptions = (
  params?: FindRatioParams,
  options?: RequestInit,
) => ({
  queryKey: salesKeys.ratio(params),
  queryFn: () => getSalesRatio(params, options),
  staleTime: 60_000,
});
