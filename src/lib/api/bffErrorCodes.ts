const BFF_ERROR_CODES = {
  invalidOrigin: 'BFF_INVALID_ORIGIN',
  pathNotAllowed: 'BFF_PATH_NOT_ALLOWED',
  upstreamTimeout: 'BFF_UPSTREAM_TIMEOUT',
  upstreamUnavailable: 'BFF_UPSTREAM_UNAVAILABLE',
  invalidUpstreamResponse: 'BFF_INVALID_UPSTREAM_RESPONSE',
} as const;

type BffErrorCode = (typeof BFF_ERROR_CODES)[keyof typeof BFF_ERROR_CODES];

export { BFF_ERROR_CODES };
export type { BffErrorCode };
