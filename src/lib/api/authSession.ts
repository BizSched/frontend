import { sendRequest } from '@lib/api/sendRequest';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';

const REFRESH_PATH = '/api/auth/refresh';
const SESSION_PATH = '/api/auth/session';

let refreshPromise: Promise<void> | null = null;
let endSessionPromise: Promise<void> | null = null;

const refreshSession = () => {
  refreshPromise ??= sendRequest<void>(REFRESH_PATH, { method: 'POST' })
    .catch(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

const redirectToLogin = () => window.location.assign(ROUTE_PATHS.login());

const endSession = () => {
  endSessionPromise ??= sendRequest<void>(SESSION_PATH, { method: 'DELETE' })
    .catch(() => undefined)
    .then(redirectToLogin);

  return endSessionPromise;
};

export { endSession, redirectToLogin, refreshSession };
