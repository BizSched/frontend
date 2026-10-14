import { queryOptions } from '@tanstack/react-query';

import { getTerms } from '@lib/api/entities/terms/api';

const termsKeys = {
  all: ['terms'] as const,
  list: () => [...termsKeys.all, 'list'] as const,
};

const termsQueryOptions = (options?: RequestInit) =>
  queryOptions({
    queryKey: termsKeys.list(),
    queryFn: ({ signal }) => getTerms({ ...options, signal }),
    throwOnError: false,
  });

export { termsKeys, termsQueryOptions };
