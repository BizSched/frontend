// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearAuthCookies,
  getAuthCookies,
  setAuthCookies,
} from '@lib/api/bff/authCookies';

const cookieValues = new Map<string, string>();
const setCookie = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value === undefined ? undefined : { name, value };
    },
    has: (name: string) => cookieValues.has(name),
    set: setCookie,
  }),
}));

const BASE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
  path: '/',
};

const TEMP_TOKEN_CLEAR_OPTIONS = { ...BASE_OPTIONS, maxAge: 0 };

describe('getAuthCookies', () => {
  beforeEach(() => {
    cookieValues.clear();
  });

  it('쿠키 3종을 읽고 auto_login을 boolean으로 바꾼다', async () => {
    cookieValues.set('access_token', 'access');
    cookieValues.set('refresh_token', 'refresh');
    cookieValues.set('auto_login', 'true');

    await expect(getAuthCookies()).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: true,
    });
  });

  it('쿠키가 없으면 토큰은 undefined, autoLogin은 false다', async () => {
    await expect(getAuthCookies()).resolves.toEqual({
      accessToken: undefined,
      refreshToken: undefined,
      autoLogin: false,
    });
  });

  it('auto_login이 true가 아니면 false다', async () => {
    cookieValues.set('auto_login', 'false');

    await expect(getAuthCookies()).resolves.toMatchObject({
      autoLogin: false,
    });
  });
});

describe('setAuthCookies', () => {
  beforeEach(() => {
    cookieValues.clear();
    setCookie.mockClear();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('autoLogin이 true면 세 쿠키를 30일 수명으로 저장한다', async () => {
    await setAuthCookies({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: true,
    });

    const options = { ...BASE_OPTIONS, maxAge: 2_592_000 };
    expect(setCookie).toHaveBeenCalledTimes(3);
    expect(setCookie).toHaveBeenCalledWith('access_token', 'access', options);
    expect(setCookie).toHaveBeenCalledWith('refresh_token', 'refresh', options);
    expect(setCookie).toHaveBeenCalledWith('auto_login', 'true', options);
  });

  it('autoLogin이 false면 maxAge 없이 세션 쿠키로 저장한다', async () => {
    await setAuthCookies({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: false,
    });

    expect(setCookie).toHaveBeenCalledWith(
      'access_token',
      'access',
      BASE_OPTIONS,
    );
    expect(setCookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh',
      BASE_OPTIONS,
    );
    expect(setCookie).toHaveBeenCalledWith('auto_login', 'false', BASE_OPTIONS);
  });

  it('production에서만 Secure를 켠다', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    await setAuthCookies({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: false,
    });

    expect(setCookie).toHaveBeenCalledWith(
      'access_token',
      'access',
      expect.objectContaining({ secure: true }),
    );
  });

  it('temp_token이 남아 있으면 지운다', async () => {
    cookieValues.set('temp_token', 'temp');

    await setAuthCookies({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: false,
    });

    expect(setCookie).toHaveBeenCalledTimes(4);
    expect(setCookie).toHaveBeenCalledWith(
      'temp_token',
      '',
      TEMP_TOKEN_CLEAR_OPTIONS,
    );
  });
});

describe('clearAuthCookies', () => {
  beforeEach(() => {
    cookieValues.clear();
    setCookie.mockClear();
  });

  it('세 쿠키를 같은 path에서 Max-Age=0으로 지운다', async () => {
    await clearAuthCookies();

    const options = { ...BASE_OPTIONS, maxAge: 0 };
    expect(setCookie).toHaveBeenCalledTimes(3);
    expect(setCookie).toHaveBeenCalledWith('access_token', '', options);
    expect(setCookie).toHaveBeenCalledWith('refresh_token', '', options);
    expect(setCookie).toHaveBeenCalledWith('auto_login', '', options);
  });

  it('temp_token이 남아 있으면 함께 지운다', async () => {
    cookieValues.set('temp_token', 'temp');

    await clearAuthCookies();

    expect(setCookie).toHaveBeenCalledTimes(4);
    expect(setCookie).toHaveBeenCalledWith(
      'temp_token',
      '',
      TEMP_TOKEN_CLEAR_OPTIONS,
    );
  });
});
