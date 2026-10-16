import { match, P } from 'ts-pattern';

import { ApiError } from '@lib/api/apiError';

const retryApiQuery = (failureCount: number, error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), () => false)
    .otherwise(() => failureCount < 3);

const throwCoreQueryError = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ status }) => status === 403)
    .otherwise(() => true);

export { retryApiQuery, throwCoreQueryError };
