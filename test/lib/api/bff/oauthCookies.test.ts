// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  clearOAuthRequestCookies,
  clearTempToken,
  getOAuthRequestCookies,
  getTempToken,
  setOAuthRequestCookies,
  setTempToken,
} from '@lib/api/bff/oauthCookies';

const cookieValues = new Map<string, string>();
const setCookie = vi.fn();

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value === undefined ? undefined : { name, value };
    },
    set: setCookie,
  }),
}));

const BASE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'lax',
};

beforeEach(() => {
  cookieValues.clear();
  setCookie.mockClear();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('setOAuthRequestCookies', () => {
  it.each(['kakao', 'google'] as const)(
    '%s 콜백 path에 state·code_verifier를 10분 수명으로 저장한다',
    async (provider) => {
      await setOAuthRequestCookies(provider, {
        state: 'state',
        codeVerifier: 'verifier',
      });

      const options = {
        ...BASE_OPTIONS,
        path: `/oauth/${provider}`,
        maxAge: 600,
      };
      expect(setCookie).toHaveBeenCalledTimes(2);
      expect(setCookie).toHaveBeenCalledWith('oauth_state', 'state', options);
      expect(setCookie).toHaveBeenCalledWith(
        'oauth_code_verifier',
        'verifier',
        options,
      );
    },
  );

  it('production에서만 Secure를 켠다', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    await setOAuthRequestCookies('kakao', {
      state: 'state',
      codeVerifier: 'verifier',
    });

    expect(setCookie).toHaveBeenCalledWith(
      'oauth_state',
      'state',
      expect.objectContaining({ secure: true }),
    );
  });
});

describe('getOAuthRequestCookies', () => {
  it('state와 code_verifier를 읽는다', async () => {
    cookieValues.set('oauth_state', 'state');
    cookieValues.set('oauth_code_verifier', 'verifier');

    await expect(getOAuthRequestCookies()).resolves.toEqual({
      state: 'state',
      codeVerifier: 'verifier',
    });
  });

  it('쿠키가 모두 없으면 null이다', async () => {
    await expect(getOAuthRequestCookies()).resolves.toBeNull();
  });

  it.each([
    ['state만 있음', { oauth_state: 'state' }],
    ['code_verifier만 있음', { oauth_code_verifier: 'verifier' }],
    ['state가 빈 값', { oauth_state: '', oauth_code_verifier: 'verifier' }],
    [
      'code_verifier가 빈 값',
      { oauth_state: 'state', oauth_code_verifier: '' },
    ],
  ])('%s이면 null이다', async (_, values) => {
    for (const [name, value] of Object.entries(values)) {
      cookieValues.set(name, value);
    }

    await expect(getOAuthRequestCookies()).resolves.toBeNull();
  });
});

describe('clearOAuthRequestCookies', () => {
  it('저장할 때와 같은 콜백 path에서 Max-Age=0으로 지운다', async () => {
    await clearOAuthRequestCookies('google');

    const options = { ...BASE_OPTIONS, path: '/oauth/google', maxAge: 0 };
    expect(setCookie).toHaveBeenCalledTimes(2);
    expect(setCookie).toHaveBeenCalledWith('oauth_state', '', options);
    expect(setCookie).toHaveBeenCalledWith('oauth_code_verifier', '', options);
  });
});

describe('setTempToken', () => {
  it('temp_token을 path /에 30분 수명으로 저장한다', async () => {
    await setTempToken('temp');

    expect(setCookie).toHaveBeenCalledWith('temp_token', 'temp', {
      ...BASE_OPTIONS,
      path: '/',
      maxAge: 1800,
    });
  });

  it('production에서만 Secure를 켠다', async () => {
    vi.stubEnv('NODE_ENV', 'production');

    await setTempToken('temp');

    expect(setCookie).toHaveBeenCalledWith(
      'temp_token',
      'temp',
      expect.objectContaining({ secure: true }),
    );
  });
});

describe('getTempToken', () => {
  it('temp_token을 읽는다', async () => {
    cookieValues.set('temp_token', 'temp');

    await expect(getTempToken()).resolves.toBe('temp');
  });

  it('쿠키가 없으면 undefined다', async () => {
    await expect(getTempToken()).resolves.toBeUndefined();
  });

  it('빈 값이면 undefined다', async () => {
    cookieValues.set('temp_token', '');

    await expect(getTempToken()).resolves.toBeUndefined();
  });
});

describe('clearTempToken', () => {
  it('path /에서 Max-Age=0으로 지운다', async () => {
    await clearTempToken();

    expect(setCookie).toHaveBeenCalledWith('temp_token', '', {
      ...BASE_OPTIONS,
      path: '/',
      maxAge: 0,
    });
  });
});
