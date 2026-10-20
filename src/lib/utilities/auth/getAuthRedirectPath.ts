import { ROUTE_PATHS } from '@lib/utilities/routePaths';

const PUBLIC_PATHS = new Set([
  ROUTE_PATHS.home(),
  ROUTE_PATHS.login(),
  ROUTE_PATHS.signup(),
  ROUTE_PATHS.onboarding(),
]);

const GUEST_ONLY_PATHS = new Set([ROUTE_PATHS.login(), ROUTE_PATHS.signup()]);

const getAuthRedirectPath = (pathname: string, hasSession: boolean) => {
  // NOTE: 소셜 콜백은 로그인 여부와 관계없이 실행되어야 해서 접두사로 통과시키고, provider 검증은 콜백이 한다 (docs/architecture/auth.md "로그인 상태 판단")
  if (pathname.startsWith(ROUTE_PATHS.oauthCallbackPrefix())) return null;
  if (!hasSession && !PUBLIC_PATHS.has(pathname)) return ROUTE_PATHS.login();
  if (hasSession && GUEST_ONLY_PATHS.has(pathname)) {
    return ROUTE_PATHS.dashboard();
  }
  return null;
};

export { getAuthRedirectPath };
