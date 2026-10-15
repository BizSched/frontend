'use client';

import { useQuery } from '@tanstack/react-query';

import type { FindRatioParams } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesRatioQueryOptions } from './salesQueryOptions';

export const useSalesRatio = (params?: FindRatioParams) => {
  return useQuery(salesRatioQueryOptions(params));
};
