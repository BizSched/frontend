import 'server-only';

import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAMES } from '@lib/api/bff/authCookieNames';

const AUTO_LOGIN_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

interface AuthCookieValues {
  accessToken: string;
  refreshToken: string;
  autoLogin: boolean;
}

interface StoredAuthCookies {
  accessToken?: string;
  refreshToken?: string;
  autoLogin: boolean;
}

const getBaseCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

const getAuthCookies = async (): Promise<StoredAuthCookies> => {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value,
    refreshToken: cookieStore.get(AUTH_COOKIE_NAMES.refreshToken)?.value,
    autoLogin: cookieStore.get(AUTH_COOKIE_NAMES.autoLogin)?.value === 'true',
  };
};

const setAuthCookies = async ({
  accessToken,
  refreshToken,
  autoLogin,
}: AuthCookieValues) => {
  const cookieStore = await cookies();
  // NOTE: 자동 로그인이 꺼져 있으면 maxAge 없이 세션 쿠키로 둔다 (docs/architecture/auth.md "토큰 쿠키")
  const options = {
    ...getBaseCookieOptions(),
    ...(autoLogin && { maxAge: AUTO_LOGIN_MAX_AGE_SECONDS }),
  };

  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, accessToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, refreshToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.autoLogin, String(autoLogin), options);
};

const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  const options = { ...getBaseCookieOptions(), maxAge: 0 };

  for (const name of Object.values(AUTH_COOKIE_NAMES)) {
    cookieStore.set(name, '', options);
  }
};

export { clearAuthCookies, getAuthCookies, setAuthCookies };
export type { AuthCookieValues, StoredAuthCookies };
