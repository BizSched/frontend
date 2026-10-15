import { queryOptions } from '@tanstack/react-query';

import {
  getScheduleList,
  type ScheduleListParams,
} from '@lib/api/entities/schedule/api';
import { retryApiQuery, throwCoreQueryError } from '@lib/api/queryErrorPolicy';

const scheduleKeys = {
  all: ['schedule'] as const,
  lists: () => [...scheduleKeys.all, 'list'] as const,
  list: ({ from, to, staffId }: ScheduleListParams) =>
    [...scheduleKeys.lists(), { from, to, staffId: staffId ?? null }] as const,
};

const scheduleListQueryOptions = (
  params: ScheduleListParams,
  options?: RequestInit,
) =>
  queryOptions({
    queryKey: scheduleKeys.list(params),
    queryFn: ({ signal }) => getScheduleList(params, { ...options, signal }),
    staleTime: 60_000,
    retry: retryApiQuery,
    throwOnError: throwCoreQueryError,
  });

export { scheduleKeys, scheduleListQueryOptions };
