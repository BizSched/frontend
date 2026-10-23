import { setAuthCookies } from '@lib/api/bff/authCookies';
import { createValidationErrorResponse } from '@lib/api/bff/bffErrorResponse';
import { withBffHandler } from '@lib/api/bff/withBffHandler';
import { login1 } from '@lib/api/generated/auth/auth';
import { Login1Body, Login1Response } from '@lib/api/generated/auth/auth.zod';

export const POST = withBffHandler(async (request) => {
  const body = Login1Body.safeParse(await request.json().catch(() => null));
  if (!body.success) return createValidationErrorResponse();

  const { accessToken, refreshToken, user } = Login1Response.parse(
    await login1(body.data),
  );

  await setAuthCookies({
    accessToken,
    refreshToken,
    autoLogin: body.data.autoLogin ?? false,
  });

  return Response.json({ user });
});
