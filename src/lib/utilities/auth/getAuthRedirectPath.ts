import { ROUTE_PATHS } from '@lib/utilities/routePaths';

const PUBLIC_PATHS = new Set([
  ROUTE_PATHS.home(),
  ROUTE_PATHS.login(),
  ROUTE_PATHS.signup(),
  ROUTE_PATHS.onboarding(),
]);

const GUEST_ONLY_PATHS = new Set([ROUTE_PATHS.login(), ROUTE_PATHS.signup()]);

const getAuthRedirectPath = (pathname: string, hasSession: boolean) => {
  if (!hasSession && !PUBLIC_PATHS.has(pathname)) return ROUTE_PATHS.login();
  if (hasSession && GUEST_ONLY_PATHS.has(pathname)) {
    return ROUTE_PATHS.dashboard();
  }
  return null;
};

export { getAuthRedirectPath };
