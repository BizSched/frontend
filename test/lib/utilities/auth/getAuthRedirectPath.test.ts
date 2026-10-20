import { describe, expect, it } from 'vitest';

import { getAuthRedirectPath } from '@lib/utilities/auth/getAuthRedirectPath';

const NO_COOKIES = { hasSession: false, hasTempToken: false };
const SESSION = { hasSession: true, hasTempToken: false };
const TEMP_TOKEN = { hasSession: false, hasTempToken: true };
const SESSION_AND_TEMP_TOKEN = { hasSession: true, hasTempToken: true };

describe('getAuthRedirectPath', () => {
  describe('세션(refresh 쿠키)이 없을 때', () => {
    it.each([
      '/dashboard',
      '/sales/dashboard',
      '/sales/details',
      '/partTime/schedule',
      '/partTime/staff/3/edit',
      '/새로-추가될-페이지',
    ])(
      '새 페이지가 생겨도 보호되도록 공개 목록에 없는 %s는 /login으로 보낸다',
      (path) => {
        expect(getAuthRedirectPath(path, NO_COOKIES)).toBe('/login');
      },
    );

    it.each(['/', '/login', '/signup'])(
      '공개 페이지 %s는 그대로 연다',
      (path) => {
        expect(getAuthRedirectPath(path, NO_COOKIES)).toBeNull();
      },
    );
  });

  describe('세션(refresh 쿠키)이 있을 때', () => {
    it.each(['/login', '/signup'])(
      '이미 로그인한 사용자가 %s에 오면 /dashboard로 보낸다',
      (path) => {
        expect(getAuthRedirectPath(path, SESSION)).toBe('/dashboard');
      },
    );

    it.each(['/', '/dashboard', '/partTime/staff/3/edit'])(
      '%s는 그대로 연다',
      (path) => {
        expect(getAuthRedirectPath(path, SESSION)).toBeNull();
      },
    );
  });

  describe('온보딩', () => {
    it.each([
      ['세션 없음', TEMP_TOKEN],
      ['세션 있음', SESSION_AND_TEMP_TOKEN],
    ])(
      '유효성은 제출할 때 BE가 판단하므로 temp_token이 있기만 하면 %s이어도 그대로 연다',
      (_, cookies) => {
        expect(getAuthRedirectPath('/onboarding', cookies)).toBeNull();
      },
    );

    it('temp_token과 세션이 모두 없으면 /login으로 보낸다', () => {
      expect(getAuthRedirectPath('/onboarding', NO_COOKIES)).toBe('/login');
    });

    it('temp_token 없이 세션만 있으면 /dashboard로 보낸다', () => {
      expect(getAuthRedirectPath('/onboarding', SESSION)).toBe('/dashboard');
    });

    it('temp_token은 온보딩만 열고 보호 페이지의 세션을 대신하지 않는다', () => {
      expect(getAuthRedirectPath('/dashboard', TEMP_TOKEN)).toBe('/login');
    });
  });

  describe('소셜 로그인 콜백', () => {
    it.each(['/oauth/kakao', '/oauth/google', '/oauth/unknown'])(
      '세션이 없어도 %s는 콜백까지 보낸다. provider 검증은 콜백이 한다',
      (path) => {
        expect(getAuthRedirectPath(path, NO_COOKIES)).toBeNull();
      },
    );

    it.each(['/oauth/kakao', '/oauth/google'])(
      '세션이 있어도 %s는 /dashboard로 보내지 않는다',
      (path) => {
        expect(getAuthRedirectPath(path, SESSION)).toBeNull();
      },
    );

    it('접두사가 아닌 /oauth는 보호 페이지로 본다', () => {
      expect(getAuthRedirectPath('/oauth', NO_COOKIES)).toBe('/login');
    });
  });
});
