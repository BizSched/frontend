'use client';

import { useQuery } from '@tanstack/react-query';

import type { FindSummaryParams } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesSummaryQueryOptions } from './salesQueryOptions';

export const useSalesSummary = (params?: FindSummaryParams) => {
  return useQuery(salesSummaryQueryOptions(params));
};
