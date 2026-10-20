import { describe, expect, it } from 'vitest';

import {
  formatSocialLoginError,
  SOCIAL_LOGIN_ERROR_MESSAGES,
} from '@lib/api/entities/auth/formatSocialLoginError';

describe('formatSocialLoginError', () => {
  it('socialError가 없으면 문구를 돌려주지 않는다', () => {
    expect(formatSocialLoginError(undefined)).toBeUndefined();
    expect(formatSocialLoginError(undefined, 'EMAIL')).toBeUndefined();
  });

  it.each([
    ['EMAIL', SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_EMAIL],
    ['KAKAO', SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_KAKAO],
    ['GOOGLE', SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT_GOOGLE],
  ])(
    'SOCIAL_EMAIL_CONFLICT는 joinType %s의 가입 방법을 안내한다',
    (joinType, message) => {
      expect(formatSocialLoginError('SOCIAL_EMAIL_CONFLICT', joinType)).toBe(
        message,
      );
    },
  );

  it.each([undefined, '', 'NAVER', 'email', ['EMAIL']])(
    'SOCIAL_EMAIL_CONFLICT의 joinType이 %j이면 가입 방법 없이 안내한다',
    (joinType) => {
      expect(formatSocialLoginError('SOCIAL_EMAIL_CONFLICT', joinType)).toBe(
        SOCIAL_LOGIN_ERROR_MESSAGES.EMAIL_CONFLICT,
      );
    },
  );

  it.each([
    ['OAUTH_EMAIL_REQUIRED', SOCIAL_LOGIN_ERROR_MESSAGES.OAUTH_EMAIL_REQUIRED],
    ['INVALID_TEMP_TOKEN', SOCIAL_LOGIN_ERROR_MESSAGES.INVALID_TEMP_TOKEN],
    [
      'SOCIAL_ACCOUNT_ALREADY_REGISTERED',
      SOCIAL_LOGIN_ERROR_MESSAGES.SOCIAL_ACCOUNT_ALREADY_REGISTERED,
    ],
    ['BFF_INVALID_OAUTH_STATE', SOCIAL_LOGIN_ERROR_MESSAGES.COMMON],
  ])('%s는 정해진 문구로 바꾼다', (socialError, message) => {
    expect(formatSocialLoginError(socialError)).toBe(message);
  });

  it.each([
    'INVALID_AUTHORIZATION_CODE',
    'BFF_UPSTREAM_TIMEOUT',
    '<script>alert(1)</script>',
    '',
    ['OAUTH_EMAIL_REQUIRED'],
  ])('알 수 없는 값 %j는 공통 소셜 실패 문구로 보여준다', (socialError) => {
    expect(formatSocialLoginError(socialError)).toBe(
      SOCIAL_LOGIN_ERROR_MESSAGES.COMMON,
    );
  });
});
