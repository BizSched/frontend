import { NextResponse } from 'next/server';
import * as zod from 'zod';

import { setAuthCookies } from '@lib/api/bff/authCookies';
import { toBffError } from '@lib/api/bff/bffErrorResponse';
import {
  clearOAuthRequestCookies,
  clearTempToken,
  getOAuthRequestCookies,
  setTempToken,
} from '@lib/api/bff/oauthCookies';
import { parseOAuthProvider } from '@lib/api/bff/oauthProvider';
import { BFF_ERROR_CODES } from '@lib/api/bffErrorCodes';
import { login } from '@lib/api/generated/oauth/oauth';
import { LoginResponse } from '@lib/api/generated/oauth/oauth.zod';
import { createSocialErrorPath } from '@lib/utilities/auth/createSocialErrorPath';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';

// NOTE: 생성 zod는 세 토큰을 모두 nullish로 두므로 분기별 필수 토큰을 다시 검증한다 (docs/architecture/auth.md "콜백")
const SocialLoginResult = zod.discriminatedUnion('isNewUser', [
  LoginResponse.extend({
    isNewUser: zod.literal(false),
    accessToken: zod.string().min(1),
    refreshToken: zod.string().min(1),
  }),
  LoginResponse.extend({
    isNewUser: zod.literal(true),
    tempToken: zod.string().min(1),
  }),
]);

const redirectTo = (request: Request, path: string) =>
  NextResponse.redirect(new URL(path, request.url), 303);

// NOTE: 브라우저가 이동해 오는 GET이라 withBffHandler의 JSON 에러 응답 대신 실패도 리다이렉트로 끝낸다
export async function GET(
  request: Request,
  context: RouteContext<'/oauth/[provider]'>,
) {
  const provider = parseOAuthProvider((await context.params).provider);
  if (!provider) return new Response(null, { status: 404 });

  const storedRequest = await getOAuthRequestCookies();
  // NOTE: 인가 요청 값은 한 번만 쓰도록 결과와 관계없이 지운다. 변경분은 아래 리다이렉트 응답에 합쳐진다
  await clearOAuthRequestCookies(provider);

  const { searchParams } = new URL(request.url);
  // NOTE: 동의 취소 등 사용자가 직접 멈춘 경우라 문구 없이 보내고, 진행 중인 온보딩의 temp_token은 유지한다
  if (searchParams.has('error')) {
    return redirectTo(request, ROUTE_PATHS.login());
  }

  const state = searchParams.get('state');
  const code = searchParams.get('code');
  if (!storedRequest || !state || !code || state !== storedRequest.state) {
    return redirectTo(
      request,
      createSocialErrorPath(BFF_ERROR_CODES.invalidOAuthState),
    );
  }

  try {
    const result = SocialLoginResult.parse(
      await login(provider, {
        authorizationCode: code,
        codeVerifier: storedRequest.codeVerifier,
      }),
    );

    if (!result.isNewUser) {
      await setAuthCookies({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        autoLogin: false,
      });
      return redirectTo(request, ROUTE_PATHS.dashboard());
    }

    await setTempToken(result.tempToken);
    return redirectTo(request, ROUTE_PATHS.onboarding());
  } catch (error) {
    // NOTE: BE를 부른 시도는 이전 가입 시도를 대체하므로, 실패하면 남은 temp_token으로 온보딩이 이어지지 않게 지운다
    await clearTempToken();
    const { errorCode, data } = toBffError(error);

    return redirectTo(request, createSocialErrorPath(errorCode, data));
  }
}
