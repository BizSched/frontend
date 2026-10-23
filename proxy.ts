import { type NextRequest, NextResponse } from 'next/server';

import {
  AUTH_COOKIE_NAMES,
  OAUTH_COOKIE_NAMES,
} from '@lib/api/bff/authCookieNames';
import { getAuthRedirectPath } from '@lib/utilities/auth/getAuthRedirectPath';

export function proxy(request: NextRequest) {
  const redirectPath = getAuthRedirectPath(request.nextUrl.pathname, {
    hasSession: request.cookies.has(AUTH_COOKIE_NAMES.refreshToken),
    hasTempToken: request.cookies.has(OAUTH_COOKIE_NAMES.tempToken),
  });

  return redirectPath
    ? NextResponse.redirect(new URL(redirectPath, request.url))
    : NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*[.].*).*)'],
};
