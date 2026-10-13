import { describe, expect, it } from 'vitest';

import { ApiError, NetworkError } from '@lib/api/apiError';
import {
  formatAuthError,
  INVALID_CREDENTIALS_MESSAGE,
} from '@lib/api/entities/auth/formatAuthError';
import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';

describe('formatAuthError', () => {
  it('INVALID_CREDENTIALS는 소셜 로그인 안내가 포함된 FE 문구로 바꾼다', () => {
    const error = new ApiError('INVALID_CREDENTIALS', 401, 'BE 문구');

    expect(formatAuthError(error)).toBe(INVALID_CREDENTIALS_MESSAGE);
  });

  it('매핑에 없는 ApiError는 공통 formatter로 넘겨 BE message를 쓴다', () => {
    const error = new ApiError('SOMETHING_ELSE', 400, 'BE 문구');

    expect(formatAuthError(error)).toBe('BE 문구');
  });

  it('NetworkError는 공통 문구를 보여준다', () => {
    expect(formatAuthError(new NetworkError())).toBe(COMMON_ERROR_MESSAGE);
  });
});
