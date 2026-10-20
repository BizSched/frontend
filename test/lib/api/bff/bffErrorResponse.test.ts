// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import * as zod from 'zod';

import { ApiError, NetworkError } from '@lib/api/apiError';
import {
  createInvalidOriginResponse,
  createUnauthorizedResponse,
  createValidationErrorResponse,
  toBffError,
  toBffErrorResponse,
} from '@lib/api/bff/bffErrorResponse';

vi.mock('server-only', () => ({}));

const readResponse = async (response: Response) => ({
  status: response.status,
  body: await response.json(),
});

describe('createInvalidOriginResponse', () => {
  it('403 BFF_INVALID_ORIGIN을 ErrorResponse 형태로 만든다', async () => {
    await expect(readResponse(createInvalidOriginResponse())).resolves.toEqual({
      status: 403,
      body: { code: 403, message: '', errorCode: 'BFF_INVALID_ORIGIN' },
    });
  });
});

describe('createValidationErrorResponse', () => {
  it('400 VALIDATION_ERROR를 만든다', async () => {
    await expect(
      readResponse(createValidationErrorResponse()),
    ).resolves.toEqual({
      status: 400,
      body: { code: 400, message: '', errorCode: 'VALIDATION_ERROR' },
    });
  });
});

describe('createUnauthorizedResponse', () => {
  it('401 UNAUTHORIZED를 만든다', async () => {
    await expect(readResponse(createUnauthorizedResponse())).resolves.toEqual({
      status: 401,
      body: { code: 401, message: '', errorCode: 'UNAUTHORIZED' },
    });
  });
});

describe('toBffErrorResponse', () => {
  it('ApiError는 BE의 status·errorCode·message를 그대로 전달한다', async () => {
    const error = new ApiError(
      'TOKEN_EXPIRED',
      401,
      '로그인이 만료되었습니다.',
    );

    await expect(readResponse(toBffErrorResponse(error))).resolves.toEqual({
      status: 401,
      body: {
        code: 401,
        message: '로그인이 만료되었습니다.',
        errorCode: 'TOKEN_EXPIRED',
      },
    });
  });

  it('ApiError의 data를 응답 body에 유지한다', async () => {
    const error = new ApiError('SOCIAL_EMAIL_CONFLICT', 409, '', {
      joinType: 'EMAIL',
    });

    await expect(readResponse(toBffErrorResponse(error))).resolves.toEqual({
      status: 409,
      body: {
        code: 409,
        message: '',
        errorCode: 'SOCIAL_EMAIL_CONFLICT',
        data: { joinType: 'EMAIL' },
      },
    });
  });

  it('BE message가 없던 ApiError는 message를 비운다', async () => {
    const error = new ApiError('UNKNOWN', 400);

    await expect(readResponse(toBffErrorResponse(error))).resolves.toEqual({
      status: 400,
      body: { code: 400, message: '', errorCode: 'UNKNOWN' },
    });
  });

  it('timeout으로 난 NetworkError는 504 BFF_UPSTREAM_TIMEOUT이다', async () => {
    const cause = new DOMException('timed out', 'TimeoutError');
    const error = new NetworkError({ cause });

    await expect(readResponse(toBffErrorResponse(error))).resolves.toEqual({
      status: 504,
      body: { code: 504, message: '', errorCode: 'BFF_UPSTREAM_TIMEOUT' },
    });
  });

  it('연결 실패 NetworkError는 502 BFF_UPSTREAM_UNAVAILABLE이다', async () => {
    const error = new NetworkError({ cause: new TypeError('fetch failed') });

    await expect(readResponse(toBffErrorResponse(error))).resolves.toEqual({
      status: 502,
      body: { code: 502, message: '', errorCode: 'BFF_UPSTREAM_UNAVAILABLE' },
    });
  });

  it('ZodError는 502 BFF_INVALID_UPSTREAM_RESPONSE다', async () => {
    const result = zod.object({ accessToken: zod.string() }).safeParse({});
    if (result.success) throw new Error('expected parse failure');

    await expect(
      readResponse(toBffErrorResponse(result.error)),
    ).resolves.toEqual({
      status: 502,
      body: {
        code: 502,
        message: '',
        errorCode: 'BFF_INVALID_UPSTREAM_RESPONSE',
      },
    });
  });

  it('그 밖의 에러(BE 5xx 등)는 500 INTERNAL_SERVER_ERROR다', async () => {
    await expect(
      readResponse(toBffErrorResponse(new Error('HTTP 503'))),
    ).resolves.toEqual({
      status: 500,
      body: { code: 500, message: '', errorCode: 'INTERNAL_SERVER_ERROR' },
    });
  });
});

describe('toBffError', () => {
  it('JSON 응답과 같은 status·errorCode·message·data를 돌려준다', () => {
    const error = new ApiError('SOCIAL_EMAIL_CONFLICT', 409, undefined, {
      joinType: 'KAKAO',
    });

    expect(toBffError(error)).toEqual({
      status: 409,
      errorCode: 'SOCIAL_EMAIL_CONFLICT',
      message: '',
      data: { joinType: 'KAKAO' },
    });
  });

  it('ApiError가 아니면 data가 없다', () => {
    expect(toBffError(new Error('HTTP 503'))).toEqual({
      status: 500,
      errorCode: 'INTERNAL_SERVER_ERROR',
      message: '',
    });
  });
});
