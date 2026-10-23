import { isMatching, P } from 'ts-pattern';

import { ApiError, isUnauthorizedError } from '@lib/api/apiError';
import { endSession, refreshSession } from '@lib/api/authSession';
import { isServer, sendRequest } from '@lib/api/sendRequest';
import type { CustomFetcherOptions } from '@lib/types/customFetcher';

const NO_REFRESH_PATHS = new Set([
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/session',
]);

const isTokenExpired = isMatching(
  P.instanceOf(ApiError).and({ status: 401, errorCode: 'TOKEN_EXPIRED' }),
);

const shouldRefresh = (url: string, error: unknown) =>
  !isServer() && !NO_REFRESH_PATHS.has(url) && isTokenExpired(error);

const retryAfterRefresh = async <T>(
  url: string,
  options?: CustomFetcherOptions,
) => {
  await refreshSession();

  try {
    return await sendRequest<T>(url, options);
  } catch (error) {
    if (isUnauthorizedError(error)) await endSession();
    throw error;
  }
};

const customFetcher = async <T>(
  url: string,
  options?: CustomFetcherOptions,
): Promise<T> => {
  try {
    return await sendRequest<T>(url, options);
  } catch (error) {
    if (!shouldRefresh(url, error)) throw error;
    return retryAfterRefresh<T>(url, options);
  }
};

export { customFetcher };
