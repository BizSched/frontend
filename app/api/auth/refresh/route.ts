import { getAuthCookies, setAuthCookies } from '@lib/api/bff/authCookies';
import { createUnauthorizedResponse } from '@lib/api/bff/bffErrorResponse';
import { withBffHandler } from '@lib/api/bff/withBffHandler';
import { refresh } from '@lib/api/generated/auth/auth';
import { RefreshResponse } from '@lib/api/generated/auth/auth.zod';

export const POST = withBffHandler(async () => {
  const { refreshToken, autoLogin } = await getAuthCookies();
  if (!refreshToken) return createUnauthorizedResponse();

  const tokens = RefreshResponse.parse(await refresh({ refreshToken }));
  await setAuthCookies({ ...tokens, autoLogin });

  return new Response(null, { status: 204 });
});
