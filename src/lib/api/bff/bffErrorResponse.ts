import 'server-only';

import { match, P } from 'ts-pattern';
import { ZodError } from 'zod';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { BFF_ERROR_CODES } from '@lib/api/bffErrorCodes';
import type { ErrorResponse } from '@lib/api/generated/bizSchedAPI.schemas';

const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
const UNAUTHORIZED_CODE = 'UNAUTHORIZED';
const INTERNAL_SERVER_ERROR_CODE = 'INTERNAL_SERVER_ERROR';

interface BffError {
  status: number;
  errorCode: string;
  message: string;
  data?: unknown;
}

const createErrorResponse = (status: number, errorCode: string, message = '') =>
  Response.json({ code: status, message, errorCode } satisfies ErrorResponse, {
    status,
  });

const createInvalidOriginResponse = () =>
  createErrorResponse(403, BFF_ERROR_CODES.invalidOrigin);

const createPathNotAllowedResponse = () =>
  createErrorResponse(404, BFF_ERROR_CODES.pathNotAllowed);

const createValidationErrorResponse = () =>
  createErrorResponse(400, VALIDATION_ERROR_CODE);

const createUnauthorizedResponse = () =>
  createErrorResponse(401, UNAUTHORIZED_CODE);

const isTimeout = (error: NetworkError) =>
  error.cause instanceof Error && error.cause.name === 'TimeoutError';

// NOTE: 요청 body 검증은 호출부가 safeParse 후 createValidationErrorResponse로 처리하므로, 여기서 만나는 ZodError는 BE 응답 검증 실패다
const toBffError = (error: unknown): BffError =>
  match(error)
    .with(
      P.instanceOf(ApiError),
      ({ status, errorCode, message, data }): BffError => ({
        status,
        errorCode,
        // NOTE: BE message가 없으면 ApiError가 errorCode를 message로 쓰므로, 화면 문구로 새지 않게 비운다
        message: message === errorCode ? '' : message,
        data,
      }),
    )
    .with(P.instanceOf(NetworkError), (networkError): BffError =>
      isTimeout(networkError)
        ? {
            status: 504,
            errorCode: BFF_ERROR_CODES.upstreamTimeout,
            message: '',
          }
        : {
            status: 502,
            errorCode: BFF_ERROR_CODES.upstreamUnavailable,
            message: '',
          },
    )
    .with(P.instanceOf(ZodError), (): BffError => ({
      status: 502,
      errorCode: BFF_ERROR_CODES.invalidUpstreamResponse,
      message: '',
    }))
    // NOTE: customFetcher는 BE 5xx의 status를 남기지 않으므로 500으로 통일한다
    .otherwise((): BffError => ({
      status: 500,
      errorCode: INTERNAL_SERVER_ERROR_CODE,
      message: '',
    }));

const toBffErrorResponse = (error: unknown) => {
  const { status, errorCode, message, data } = toBffError(error);

  return Response.json(
    { code: status, message, errorCode, data } satisfies Omit<
      ErrorResponse,
      'data'
    > & { data?: unknown },
    { status },
  );
};

export {
  createInvalidOriginResponse,
  createPathNotAllowedResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  toBffError,
  toBffErrorResponse,
};
export type { BffError };
