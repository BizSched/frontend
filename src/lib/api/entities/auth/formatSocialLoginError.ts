import { match } from 'ts-pattern';

import { BFF_ERROR_CODES } from '@lib/api/bffErrorCodes';

const SOCIAL_LOGIN_ERROR_MESSAGES = {
  EMAIL_CONFLICT_EMAIL:
    '이메일로 가입된 계정입니다. 이메일 로그인을 이용해주세요.',
  EMAIL_CONFLICT_KAKAO:
    '카카오로 가입된 계정입니다. 카카오 로그인을 이용해주세요.',
  EMAIL_CONFLICT_GOOGLE:
    '구글로 가입된 계정입니다. 구글 로그인을 이용해주세요.',
  EMAIL_CONFLICT: '이미 가입된 이메일입니다. 가입한 방법으로 로그인해주세요.',
  OAUTH_EMAIL_REQUIRED:
    '이메일 제공에 동의해야 가입할 수 있어요. 다시 시도해 동의해주세요.',
  INVALID_TEMP_TOKEN: '가입 시간이 지났어요. 소셜 로그인을 다시 진행해주세요.',
  SOCIAL_ACCOUNT_ALREADY_REGISTERED:
    '이미 가입이 완료됐어요. 소셜 로그인을 다시 눌러주세요.',
  COMMON: '소셜 로그인에 실패했어요. 다시 시도해주세요.',
} as const;

const formatEmailConflict = (joinType: unknown) =>
  match(joinType)
    .with('EMAIL', () => SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_EMAIL)
    .with('KAKAO', () => SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_KAKAO)
    .with('GOOGLE', () => SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_GOOGLE)
    .otherwise(() => SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT);

// NOTE: 쿼리 값은 누구나 만들 수 있으므로 정해진 값만 문구로 바꾸고 그대로 출력하지 않는다 (docs/feature/auth/login.md "소셜 로그인 실패 안내")
const formatSocialLoginError = (socialError: unknown, joinType?: unknown) =>
  match(socialError)
    .with(undefined, () => undefined)
    .with('SOCIAL_EMAIL_CONFLICT', () => formatEmailConflict(joinType))
    .with(
      'OAUTH_EMAIL_REQUIRED',
      () => SOCIAL_LOGIN_ERROR_MESSAGES.OAUTH_EMAIL_REQUIRED,
    )
    .with(
      'INVALID_TEMP_TOKEN',
      () => SOCIAL_LOGIN_ERROR_MESSAGES.INVALID_TEMP_TOKEN,
    )
    .with(
      'SOCIAL_ACCOUNT_ALREADY_REGISTERED',
      () => SOCIAL_LOGIN_ERROR_MESSAGES.SOCIAL_ACCOUNT_ALREADY_REGISTERED,
    )
    .with(
      BFF_ERROR_CODES.invalidOAuthState,
      () => SOCIAL_LOGIN_ERROR_MESSAGES.COMMON,
    )
    .otherwise(() => SOCIAL_LOGIN_ERROR_MESSAGES.COMMON);

export { formatSocialLoginError, SOCIAL_LOGIN_ERROR_MESSAGES };
