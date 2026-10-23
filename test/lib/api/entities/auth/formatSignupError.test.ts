import { describe, expect, it } from 'vitest';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { formatSignupError } from '@lib/api/entities/auth/formatSignupError';
import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';

describe('formatSignupError', () => {
  it.each([
    ['EMAIL_ALREADY_EXISTS', 409, '이미 가입된 이메일입니다.'],
    ['INVALID_EMAIL_FORMAT', 400, '올바른 이메일 형식이 아닙니다.'],
    [
      'INVALID_PASSWORD_FORMAT',
      400,
      '비밀번호는 공백 없이 8~20자의 영문과 숫자를 포함해야 합니다.',
    ],
    ['INVALID_INDUSTRY_VALUE', 400, '업종을 다시 선택해주세요.'],
    ['REQUIRED_TERMS_NOT_AGREED', 400, '필수 약관에 모두 동의해주세요.'],
  ])('%s는 가입 안내 문구로 바꾼다', (code, status, message) => {
    expect(
      formatSignupError(
        new ApiError(code as string, status as number, 'BE 문구'),
      ),
    ).toBe(message);
  });

  it('알려지지 않은 400 코드는 BE 문구를 보여준다', () => {
    expect(
      formatSignupError(new ApiError('UNKNOWN', 400, '이름을 확인해주세요.')),
    ).toBe('이름을 확인해주세요.');
  });

  it.each([
    new Error('HTTP 500'),
    new NetworkError(),
    new ApiError('BFF_INVALID_ORIGIN', 403),
  ])('공통 오류는 공통 문구로 바꾼다: %s', (error) => {
    expect(formatSignupError(error)).toBe(COMMON_ERROR_MESSAGE);
  });
});
