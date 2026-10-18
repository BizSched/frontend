import { queryOptions } from '@tanstack/react-query';

import { getMe } from '@lib/api/entities/users/api';
import { retryApiQuery } from '@lib/api/queryErrorPolicy';

const userKeys = {
  all: ['users'] as const,
  me: () => [...userKeys.all, 'me'] as const,
};

const meQueryOptions = (options?: RequestInit) =>
  queryOptions({
    queryKey: userKeys.me(),
    queryFn: ({ signal }) => getMe({ ...options, signal }),
    staleTime: 5 * 60_000,
    retry: retryApiQuery,
    throwOnError: false,
  });

export { meQueryOptions, userKeys };
