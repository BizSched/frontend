import 'server-only';

import type { OAuthProvider } from '@lib/api/bff/oauthProvider';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';

interface OAuthClientConfig {
  clientId: string;
  redirectUri: string;
}

interface OAuthAuthorizeValues {
  state: string;
  codeChallenge: string;
}

const AUTHORIZE_ENDPOINTS = {
  kakao: 'https://kauth.kakao.com/oauth/authorize',
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
} as const satisfies Record<OAuthProvider, string>;

const CLIENT_ID_ENV_NAMES = {
  kakao: 'KAKAO_CLIENT_ID',
  google: 'GOOGLE_CLIENT_ID',
} as const satisfies Record<OAuthProvider, string>;

const SCOPES: Partial<Record<OAuthProvider, string>> = {
  google: 'openid email profile',
};

const readRequiredEnv = (name: string) => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);

  return value;
};

// NOTE: redirect_uri는 BE 설정값과 정확히 같아야 하므로 요청 origin이 아니라 환경 변수로 만든다 (docs/architecture/auth.md "인가 요청")
const getOAuthClientConfig = (provider: OAuthProvider): OAuthClientConfig => {
  const clientId = readRequiredEnv(CLIENT_ID_ENV_NAMES[provider]);
  const redirectOrigin = readRequiredEnv('OAUTH_REDIRECT_ORIGIN');

  return {
    clientId,
    redirectUri: new URL(ROUTE_PATHS.oauthCallback(provider), redirectOrigin)
      .href,
  };
};

const createOAuthAuthorizeUrl = (
  provider: OAuthProvider,
  { clientId, redirectUri }: OAuthClientConfig,
  { state, codeChallenge }: OAuthAuthorizeValues,
) => {
  const url = new URL(AUTHORIZE_ENDPOINTS[provider]);
  const scope = SCOPES[provider];

  url.search = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    ...(scope && { scope }),
  }).toString();

  return url;
};

export { createOAuthAuthorizeUrl, getOAuthClientConfig };
export type { OAuthAuthorizeValues, OAuthClientConfig };
