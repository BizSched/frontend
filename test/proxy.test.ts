// @vitest-environment node
import { AsyncLocalStorage } from 'node:async_hooks';

import type * as TestingUtilsModule from 'next/experimental/testing/server';
import { NextRequest } from 'next/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { config, proxy } from '@proxy';

vi.mock('server-only', () => ({}));

let testingUtils: typeof TestingUtilsModule;

const ORIGIN = 'https://bizsched.app';

const runProxy = (path: string, cookie?: string) =>
  proxy(
    new NextRequest(`${ORIGIN}${path}`, {
      headers: cookie ? { cookie } : {},
    }),
  );

const redirectPathOf = (path: string, cookie?: string) => {
  const url = testingUtils.getRedirectUrl(runProxy(path, cookie));
  return url ? new URL(url).pathname : null;
};

const isMatched = (url: string) =>
  testingUtils.unstable_doesMiddlewareMatch({ config, nextConfig: {}, url });

describe('proxy', () => {
  beforeAll(async () => {
    Object.assign(globalThis, { AsyncLocalStorage });
    testingUtils = await import('next/experimental/testing/server');
  });

  describe('matcher', () => {
    it.each([
      '/api/auth/login',
      '/api/auth/refresh',
      '/api/oauth/kakao/authorize',
      '/_next/static/chunks/main.js',
      '/_next/image',
      '/favicon.ico',
      '/next.svg',
      '/mocks/staff.png',
    ])(
      'BFF는 Route Handler가 판단하므로 %s 같은 API·정적 파일에는 실행하지 않는다',
      (url) => {
        expect(isMatched(url)).toBe(false);
      },
    );

    it.each([
      '/',
      '/login',
      '/signup',
      '/dashboard',
      '/partTime/staff/3/edit',
      '/oauth/kakao',
    ])('페이지 %s에는 실행한다', (url) => {
      expect(isMatched(url)).toBe(true);
    });
  });

  describe('리다이렉트', () => {
    it('refresh 쿠키가 없으면 보호 페이지에서 /login으로 보낸다', () => {
      expect(redirectPathOf('/dashboard')).toBe('/login');
    });

    it('refresh 쿠키가 있으면 /login에서 /dashboard로 보낸다', () => {
      expect(redirectPathOf('/login', 'refresh_token=refresh')).toBe(
        '/dashboard',
      );
    });

    it('세션을 이어갈 수 있는지는 refresh 쿠키로 판단하므로 access 쿠키만 있으면 /login으로 보낸다', () => {
      expect(redirectPathOf('/dashboard', 'access_token=access')).toBe(
        '/login',
      );
    });

    it.each([undefined, 'refresh_token=refresh'])(
      '소셜 콜백은 세션 쿠키(%s)와 관계없이 그대로 진행한다',
      (cookie) => {
        expect(
          redirectPathOf('/oauth/kakao?code=code&state=state', cookie),
        ).toBeNull();
      },
    );

    it('리다이렉트가 필요 없으면 그대로 진행한다', () => {
      expect(redirectPathOf('/dashboard', 'refresh_token=refresh')).toBeNull();
    });
  });
});
