import 'server-only';

const AUTH_COOKIE_NAMES = {
  accessToken: 'access_token',
  refreshToken: 'refresh_token',
  autoLogin: 'auto_login',
} as const;

export { AUTH_COOKIE_NAMES };
