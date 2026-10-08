import 'server-only';

import { cookies } from 'next/headers';

import { AUTH_COOKIE_NAMES } from '@lib/api/bff/authCookieNames';

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAMES.accessToken)?.value;

  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
};

export { getAuthHeaders };
