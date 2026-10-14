'use client';

import { useQuery } from '@tanstack/react-query';

import type { FindSummaryParams } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesMonthTotalQueryOptions } from './salesQueryOptions';

export const useSalesMonthTotal = (params?: FindSummaryParams) => {
  return useQuery(salesMonthTotalQueryOptions(params));
};
