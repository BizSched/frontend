class ApiError extends Error {
  readonly errorCode: string;
  readonly status: number;
  readonly data?: unknown;

  constructor(
    errorCode: string,
    status: number,
    message?: string,
    data?: unknown,
  ) {
    super(message ?? errorCode);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.status = status;
    this.data = data;
  }
}

class NetworkError extends Error {
  constructor(options?: { cause?: unknown }) {
    super('Network request failed', options);
    this.name = 'NetworkError';
  }
}

const isUnauthorizedError = (error: unknown): error is ApiError =>
  error instanceof ApiError && error.status === 401;

export { ApiError, isUnauthorizedError, NetworkError };
