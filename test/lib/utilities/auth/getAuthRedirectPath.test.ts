import { describe, expect, it } from 'vitest';

import { getAuthRedirectPath } from '@lib/utilities/auth/getAuthRedirectPath';

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
        expect(getAuthRedirectPath(path, false)).toBe('/login');
      },
    );

    it.each(['/', '/login', '/signup', '/onboarding'])(
      '공개 페이지 %s는 그대로 연다',
      (path) => {
        expect(getAuthRedirectPath(path, false)).toBeNull();
      },
    );
  });

  describe('세션(refresh 쿠키)이 있을 때', () => {
    it.each(['/login', '/signup'])(
      '이미 로그인한 사용자가 %s에 오면 /dashboard로 보낸다',
      (path) => {
        expect(getAuthRedirectPath(path, true)).toBe('/dashboard');
      },
    );

    it.each(['/', '/onboarding', '/dashboard', '/partTime/staff/3/edit'])(
      '%s는 그대로 연다',
      (path) => {
        expect(getAuthRedirectPath(path, true)).toBeNull();
      },
    );
  });
});
