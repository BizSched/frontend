class ApiError extends Error {
  readonly errorCode: string;
  readonly status: number;

  constructor(errorCode: string, status: number, message?: string) {
    super(message ?? errorCode);
    this.name = 'ApiError';
    this.errorCode = errorCode;
    this.status = status;
  }
}

class NetworkError extends Error {
  constructor(options?: { cause?: unknown }) {
    super('Network request failed', options);
    this.name = 'NetworkError';
  }
}

export { ApiError, NetworkError };
