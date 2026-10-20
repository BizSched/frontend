import 'server-only';

import { cookies } from 'next/headers';

import { OAUTH_COOKIE_NAMES } from '@lib/api/bff/authCookieNames';
import { getBaseCookieOptions } from '@lib/api/bff/cookieOptions';
import type { OAuthProvider } from '@lib/api/bff/oauthProvider';

interface OAuthRequestCookieValues {
  state: string;
  codeVerifier: string;
}

const OAUTH_REQUEST_MAX_AGE_SECONDS = 60 * 10;
const TEMP_TOKEN_MAX_AGE_SECONDS = 60 * 30;

// NOTE: 콜백 경로로 좁혀 시작한 제공자의 콜백에서만 읽히게 한다. 삭제도 같은 path여야 지워진다 (docs/architecture/auth.md "임시 쿠키")
const getOAuthRequestCookieOptions = (provider: OAuthProvider) => ({
  ...getBaseCookieOptions(),
  path: `/oauth/${provider}`,
});

const getTempTokenCookieOptions = () => ({
  ...getBaseCookieOptions(),
  path: '/',
});

const setOAuthRequestCookies = async (
  provider: OAuthProvider,
  { state, codeVerifier }: OAuthRequestCookieValues,
) => {
  const cookieStore = await cookies();
  const options = {
    ...getOAuthRequestCookieOptions(provider),
    maxAge: OAUTH_REQUEST_MAX_AGE_SECONDS,
  };

  cookieStore.set(OAUTH_COOKIE_NAMES.state, state, options);
  cookieStore.set(OAUTH_COOKIE_NAMES.codeVerifier, codeVerifier, options);
};

const getOAuthRequestCookies =
  async (): Promise<OAuthRequestCookieValues | null> => {
    const cookieStore = await cookies();
    const state = cookieStore.get(OAUTH_COOKIE_NAMES.state)?.value;
    const codeVerifier = cookieStore.get(
      OAUTH_COOKIE_NAMES.codeVerifier,
    )?.value;

    if (!state || !codeVerifier) return null;
    return { state, codeVerifier };
  };

const clearOAuthRequestCookies = async (provider: OAuthProvider) => {
  const cookieStore = await cookies();
  const options = { ...getOAuthRequestCookieOptions(provider), maxAge: 0 };

  cookieStore.set(OAUTH_COOKIE_NAMES.state, '', options);
  cookieStore.set(OAUTH_COOKIE_NAMES.codeVerifier, '', options);
};

const setTempToken = async (tempToken: string) => {
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_COOKIE_NAMES.tempToken, tempToken, {
    ...getTempTokenCookieOptions(),
    maxAge: TEMP_TOKEN_MAX_AGE_SECONDS,
  });
};

const getTempToken = async () => {
  const cookieStore = await cookies();

  return cookieStore.get(OAUTH_COOKIE_NAMES.tempToken)?.value || undefined;
};

const clearTempToken = async () => {
  const cookieStore = await cookies();

  cookieStore.set(OAUTH_COOKIE_NAMES.tempToken, '', {
    ...getTempTokenCookieOptions(),
    maxAge: 0,
  });
};

export {
  clearOAuthRequestCookies,
  clearTempToken,
  getOAuthRequestCookies,
  getTempToken,
  setOAuthRequestCookies,
  setTempToken,
};
export type { OAuthRequestCookieValues };
