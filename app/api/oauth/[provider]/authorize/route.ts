import { NextResponse } from 'next/server';

import {
  createOAuthAuthorizeUrl,
  getOAuthClientConfig,
} from '@lib/api/bff/oauthAuthorizeUrl';
import { setOAuthRequestCookies } from '@lib/api/bff/oauthCookies';
import {
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
} from '@lib/api/bff/oauthPkce';
import { parseOAuthProvider } from '@lib/api/bff/oauthProvider';

export async function GET(
  _request: Request,
  context: RouteContext<'/api/oauth/[provider]/authorize'>,
) {
  const provider = parseOAuthProvider((await context.params).provider);
  if (!provider) return new Response(null, { status: 404 });

  // NOTE: 설정이 빠졌으면 임시 쿠키를 남기지 않도록 쿠키 저장 전에 검증한다
  const clientConfig = getOAuthClientConfig(provider);
  const state = createOAuthState();
  const codeVerifier = createCodeVerifier();

  await setOAuthRequestCookies(provider, { state, codeVerifier });

  return NextResponse.redirect(
    createOAuthAuthorizeUrl(provider, clientConfig, {
      state,
      codeChallenge: createCodeChallenge(codeVerifier),
    }),
    303,
  );
}
