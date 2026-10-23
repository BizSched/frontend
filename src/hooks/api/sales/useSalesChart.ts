'use client';

import { useQuery } from '@tanstack/react-query';

import type { FindChartParams } from '@lib/api/generated/bizSchedAPI.schemas';

import { salesChartQueryOptions } from './salesQueryOptions';

export const useSalesChart = (params: FindChartParams) => {
  return useQuery({
    ...salesChartQueryOptions(params),
    placeholderData: (previousData, previousQuery) => {
      const previousParams = previousQuery?.queryKey[2];
      return typeof previousParams === 'object' &&
        previousParams !== null &&
        'date' in previousParams &&
        previousParams.date === params.date
        ? previousData
        : undefined;
    },
  });
};
