import 'server-only';

import { cookies } from 'next/headers';

import {
  AUTH_COOKIE_NAMES,
  OAUTH_COOKIE_NAMES,
} from '@lib/api/bff/authCookieNames';
import { getBaseCookieOptions } from '@lib/api/bff/cookieOptions';
import { clearTempToken } from '@lib/api/bff/oauthCookies';

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

const getAuthCookieOptions = () => ({
  ...getBaseCookieOptions(),
  path: '/',
});

// NOTE: 정식 세션이 생기거나 끝나면 남은 소셜 가입 임시 토큰을 지운다. 남아 있으면 /onboarding에서 다른 계정 가입을 마무리할 수 있다 (docs/architecture/auth.md "임시 쿠키")
const clearRemainingTempToken = async () => {
  const cookieStore = await cookies();

  if (cookieStore.has(OAUTH_COOKIE_NAMES.tempToken)) await clearTempToken();
};

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
    ...getAuthCookieOptions(),
    ...(autoLogin && { maxAge: AUTO_LOGIN_MAX_AGE_SECONDS }),
  };

  cookieStore.set(AUTH_COOKIE_NAMES.accessToken, accessToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.refreshToken, refreshToken, options);
  cookieStore.set(AUTH_COOKIE_NAMES.autoLogin, String(autoLogin), options);
  await clearRemainingTempToken();
};

const clearAuthCookies = async () => {
  const cookieStore = await cookies();
  const options = { ...getAuthCookieOptions(), maxAge: 0 };

  for (const name of Object.values(AUTH_COOKIE_NAMES)) {
    cookieStore.set(name, '', options);
  }
  await clearRemainingTempToken();
};

export { clearAuthCookies, getAuthCookies, setAuthCookies };
export type { AuthCookieValues, StoredAuthCookies };
