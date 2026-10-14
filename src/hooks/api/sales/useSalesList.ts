'use client';

import { useQuery } from '@tanstack/react-query';

import type { FindAll3Params } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesListQueryOptions } from './salesQueryOptions';

export const useSalesList = (params?: FindAll3Params) => {
  return useQuery(salesListQueryOptions(params));
};
