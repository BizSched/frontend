import { ApiError, NetworkError } from '@lib/api/apiError';
import type { ErrorResponse } from '@lib/api/generated/bizSchedAPI.schemas';

const SERVER_TIMEOUT_MS = 10_000;
const BROWSER_TIMEOUT_MS = 15_000;
const UNKNOWN_ERROR_CODE = 'UNKNOWN';

const isServer = () => typeof window === 'undefined';

const resolveUrl = (url: string) => {
  if (!isServer()) return url;

  const baseUrl = process.env.BE_BASE_URL;
  if (!baseUrl) throw new Error('BE_BASE_URL is not set');

  return `${baseUrl.replace(/\/+$/, '')}${url}`;
};

const anySignal = (signals: AbortSignal[]) => {
  // NOTE: AbortSignal.any는 Safari 17.4부터 지원되어, Next 기본 지원 범위(Safari 16.4~)를 위해 대체 경로를 둔다
  if (typeof AbortSignal.any === 'function') return AbortSignal.any(signals);

  const controller = new AbortController();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort(signal.reason);
      break;
    }
    signal.addEventListener('abort', () => controller.abort(signal.reason), {
      once: true,
    });
  }

  return controller.signal;
};

const createSignal = (callerSignal?: AbortSignal | null) => {
  const timeoutSignal = AbortSignal.timeout(
    isServer() ? SERVER_TIMEOUT_MS : BROWSER_TIMEOUT_MS,
  );

  return callerSignal
    ? anySignal([callerSignal, timeoutSignal])
    : timeoutSignal;
};

const withDefaultCache = (options?: RequestInit): RequestInit => {
  // NOTE: cache: 'no-store'와 next.revalidate를 함께 주면 Next가 둘 다 무시하므로, 호출부가 캐시 옵션을 줬으면 기본값을 넣지 않는다
  if (options?.cache || options?.next) return { ...options };
  return { cache: 'no-store', ...options };
};

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
};

const isErrorResponse = (value: unknown): value is ErrorResponse =>
  typeof value === 'object' &&
  value !== null &&
  typeof (value as Partial<ErrorResponse>).errorCode === 'string';

const toFailure = (status: number, text: string) => {
  // NOTE: 5xx는 상황별 안내를 하지 않으므로 ApiError로 변환하지 않는다 (docs/architecture/error-handling.md)
  if (status >= 500) return new Error(`HTTP ${status}`);

  const body = parseJson(text);
  if (isErrorResponse(body)) {
    return new ApiError(body.errorCode, status, body.message);
  }

  return new ApiError(UNKNOWN_ERROR_CODE, status);
};

const customFetcher = async <T>(
  url: string,
  options?: RequestInit,
): Promise<T> => {
  const requestUrl = resolveUrl(url);
  const signal = createSignal(options?.signal);
  let response: Response;
  let text: string;

  try {
    response = await fetch(requestUrl, {
      ...withDefaultCache(options),
      signal,
    });
    text = await response.text();
  } catch (error) {
    if (options?.signal?.aborted) throw error;
    throw new NetworkError({ cause: error });
  }

  if (!response.ok) throw toFailure(response.status, text);
  if (!text) return undefined as T;

  return JSON.parse(text) as T;
};

export { customFetcher };
