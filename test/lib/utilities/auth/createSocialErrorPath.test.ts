import { describe, expect, it } from 'vitest';

import { createSocialErrorPath } from '@lib/utilities/auth/createSocialErrorPath';

describe('createSocialErrorPath', () => {
  it('errorCode를 socialError 쿼리로 붙인 로그인 경로를 만든다', () => {
    expect(createSocialErrorPath('INVALID_TEMP_TOKEN')).toBe(
      '/login?socialError=INVALID_TEMP_TOKEN',
    );
  });

  it.each(['EMAIL', 'KAKAO', 'GOOGLE'])(
    'SOCIAL_EMAIL_CONFLICT는 검증한 joinType(%s)을 붙인다',
    (joinType) => {
      expect(createSocialErrorPath('SOCIAL_EMAIL_CONFLICT', { joinType })).toBe(
        `/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType=${joinType}`,
      );
    },
  );

  it.each([
    ['data 없음', undefined],
    ['joinType 없음', {}],
    ['허용되지 않은 joinType', { joinType: 'NAVER' }],
    ['소문자 joinType', { joinType: 'email' }],
    ['문자열이 아닌 joinType', { joinType: ['EMAIL'] }],
  ])('SOCIAL_EMAIL_CONFLICT의 %s이면 joinType을 붙이지 않는다', (_, data) => {
    expect(createSocialErrorPath('SOCIAL_EMAIL_CONFLICT', data)).toBe(
      '/login?socialError=SOCIAL_EMAIL_CONFLICT',
    );
  });

  it('다른 errorCode는 data에 joinType이 있어도 붙이지 않는다', () => {
    expect(
      createSocialErrorPath('OAUTH_EMAIL_REQUIRED', { joinType: 'EMAIL' }),
    ).toBe('/login?socialError=OAUTH_EMAIL_REQUIRED');
  });

  it('errorCode를 쿼리 값으로 인코딩한다', () => {
    expect(createSocialErrorPath('A&joinType=EMAIL')).toBe(
      '/login?socialError=A%26joinType%3DEMAIL',
    );
  });
});
