import 'server-only';

const AUTH_COOKIE_NAMES = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  autoLogin: 'auto_login',
} as const;

const OAUTH_COOKIE_NAMES = {
  state: 'oauth_state',
  codeVerifier: 'oauth_code_verifier',
  tempToken: 'temp_token',
} as const;

export { AUTH_COOKIE_NAMES, OAUTH_COOKIE_NAMES };
