import { isMatching, P } from 'ts-pattern';

import { ApiError } from '@lib/api/apiError';
import { setAuthCookies } from '@lib/api/bff/authCookies';
import {
  createInvalidTempTokenResponse,
  createValidationErrorResponse,
} from '@lib/api/bff/bffErrorResponse';
import { clearTempToken, getTempToken } from '@lib/api/bff/oauthCookies';
import { withBffHandler } from '@lib/api/bff/withBffHandler';
import { CompleteSocialSignupBody } from '@lib/api/completeSocialSignupBody';
import { customFetcher } from '@lib/api/customFetcher';
import { getCompleteSignupUrl } from '@lib/api/generated/oauth/oauth';
import { CompleteSignupResponse } from '@lib/api/generated/oauth/oauth.zod';

const isTempTokenClosed = isMatching(
  P.instanceOf(ApiError).and(
    P.union(
      { status: 401, errorCode: 'INVALID_TEMP_TOKEN' },
      {
        status: 409,
        errorCode: P.union(
          'SOCIAL_ACCOUNT_ALREADY_REGISTERED',
          'SOCIAL_EMAIL_CONFLICT',
        ),
      },
    ),
  ),
);

export const PATCH = withBffHandler(async (request) => {
  const body = CompleteSocialSignupBody.safeParse(
    await request.json().catch(() => null),
  );
  if (!body.success) return createValidationErrorResponse();

  const tempToken = await getTempToken();
  if (!tempToken) return createInvalidTempTokenResponse();

  try {
    // NOTE: 생성 함수 completeSignup은 요청 업종 타입이 BE Swagger의 옛 enum이라 같은 URL로 직접 부른다
    const { accessToken, refreshToken, ...user } = CompleteSignupResponse.parse(
      await customFetcher<unknown>(getCompleteSignupUrl(), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tempToken}`,
        },
        body: JSON.stringify(body.data),
      }),
    );

    await setAuthCookies({ accessToken, refreshToken, autoLogin: false });

    return Response.json(user);
  } catch (error) {
    if (isTempTokenClosed(error)) await clearTempToken();
    throw error;
  }
});
