import { match, P } from 'ts-pattern';

import { ApiError } from '@lib/api/apiError';
import { formatCommonError } from '@lib/api/formatCommonError';

const SIGNUP_ERROR_MESSAGES = {
  EMAIL_ALREADY_EXISTS: '이미 가입된 이메일입니다.',
  INVALID_EMAIL_FORMAT: '올바른 이메일 형식이 아닙니다.',
  INVALID_PASSWORD_FORMAT:
    '비밀번호는 공백 없이 8~20자의 영문과 숫자를 포함해야 합니다.',
  INVALID_INDUSTRY_VALUE: '업종을 다시 선택해주세요.',
  REQUIRED_TERMS_NOT_AGREED: '필수 약관에 모두 동의해주세요.',
} as const;

const formatSignupError = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ errorCode }) =>
      match(errorCode)
        .with(
          'EMAIL_ALREADY_EXISTS',
          () => SIGNUP_ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        )
        .with(
          'INVALID_EMAIL_FORMAT',
          () => SIGNUP_ERROR_MESSAGES.INVALID_EMAIL_FORMAT,
        )
        .with(
          'INVALID_PASSWORD_FORMAT',
          () => SIGNUP_ERROR_MESSAGES.INVALID_PASSWORD_FORMAT,
        )
        .with(
          'INVALID_INDUSTRY_VALUE',
          () => SIGNUP_ERROR_MESSAGES.INVALID_INDUSTRY_VALUE,
        )
        .with(
          'REQUIRED_TERMS_NOT_AGREED',
          () => SIGNUP_ERROR_MESSAGES.REQUIRED_TERMS_NOT_AGREED,
        )
        .otherwise(() => formatCommonError(error)),
    )
    .otherwise(() => formatCommonError(error));

export { formatSignupError, SIGNUP_ERROR_MESSAGES };
