import 'server-only';

import { match, P } from 'ts-pattern';
import { ZodError } from 'zod';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { BFF_ERROR_CODES } from '@lib/api/bffErrorCodes';
import type { ErrorResponse } from '@lib/api/generated/bizSchedAPI.schemas';

const VALIDATION_ERROR_CODE = 'VALIDATION_ERROR';
const UNAUTHORIZED_CODE = 'UNAUTHORIZED';
const INTERNAL_SERVER_ERROR_CODE = 'INTERNAL_SERVER_ERROR';

const createErrorResponse = (status: number, errorCode: string, message = '') =>
  Response.json({ code: status, message, errorCode } satisfies ErrorResponse, {
    status,
  });

const createInvalidOriginResponse = () =>
  createErrorResponse(403, BFF_ERROR_CODES.invalidOrigin);

const createValidationErrorResponse = () =>
  createErrorResponse(400, VALIDATION_ERROR_CODE);

const createUnauthorizedResponse = () =>
  createErrorResponse(401, UNAUTHORIZED_CODE);

const isTimeout = (error: NetworkError) =>
  error.cause instanceof Error && error.cause.name === 'TimeoutError';

// NOTE: 요청 body 검증은 호출부가 safeParse 후 createValidationErrorResponse로 처리하므로, 여기서 만나는 ZodError는 BE 응답 검증 실패다
const toBffErrorResponse = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ status, errorCode, message }) =>
      // NOTE: BE message가 없으면 ApiError가 errorCode를 message로 쓰므로, 화면 문구로 새지 않게 비운다
      createErrorResponse(
        status,
        errorCode,
        message === errorCode ? '' : message,
      ),
    )
    .with(P.instanceOf(NetworkError), (networkError) =>
      isTimeout(networkError)
        ? createErrorResponse(504, BFF_ERROR_CODES.upstreamTimeout)
        : createErrorResponse(502, BFF_ERROR_CODES.upstreamUnavailable),
    )
    .with(P.instanceOf(ZodError), () =>
      createErrorResponse(502, BFF_ERROR_CODES.invalidUpstreamResponse),
    )
    // NOTE: customFetcher는 BE 5xx의 status를 남기지 않으므로 500으로 통일한다
    .otherwise(() => createErrorResponse(500, INTERNAL_SERVER_ERROR_CODE));

export {
  createInvalidOriginResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  toBffErrorResponse,
};
