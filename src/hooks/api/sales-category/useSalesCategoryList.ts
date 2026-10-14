'use client';

import { useQuery } from '@tanstack/react-query';

import { salesCategoryListQueryOptions } from './salesCategoryQueryOptions';

export const useSalesCategoryList = () => {
  return useQuery(salesCategoryListQueryOptions());
};
