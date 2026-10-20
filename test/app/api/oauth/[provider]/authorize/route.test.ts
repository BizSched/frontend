// @vitest-environment node
import { createHash } from 'node:crypto';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setOAuthRequestCookies } from '@lib/api/bff/oauthCookies';

import { GET } from '@app/api/oauth/[provider]/authorize/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/oauthCookies', () => ({
  setOAuthRequestCookies: vi.fn(),
}));

const callGet = (provider: string) =>
  GET(new Request(`https://bizsched.app/api/oauth/${provider}/authorize`), {
    params: Promise.resolve({ provider }),
  });

const savedRequestOf = () => vi.mocked(setOAuthRequestCookies).mock.calls[0];

describe('GET /api/oauth/[provider]/authorize', () => {
  beforeEach(() => {
    vi.mocked(setOAuthRequestCookies).mockReset();
    vi.stubEnv('KAKAO_CLIENT_ID', 'kakao-client');
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client');
    vi.stubEnv('OAUTH_REDIRECT_ORIGIN', 'http://localhost:3000');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it.each(['naver', 'Kakao', 'kakao%2F..'])(
    '허용 목록에 없는 provider(%s)는 쿠키를 저장하지 않고 404다',
    async (provider) => {
      const response = await callGet(provider);

      expect(response.status).toBe(404);
      expect(setOAuthRequestCookies).not.toHaveBeenCalled();
    },
  );

  it('카카오 인가 주소로 303 이동하고 state·PKCE를 담는다', async () => {
    const response = await callGet('kakao');
    const location = new URL(response.headers.get('location') ?? '');
    const [provider, { state, codeVerifier }] = savedRequestOf();

    expect(response.status).toBe(303);
    expect(provider).toBe('kakao');
    expect(`${location.origin}${location.pathname}`).toBe(
      'https://kauth.kakao.com/oauth/authorize',
    );
    expect(Object.fromEntries(location.searchParams)).toEqual({
      response_type: 'code',
      client_id: 'kakao-client',
      redirect_uri: 'http://localhost:3000/oauth/kakao',
      state,
      code_challenge: createHash('sha256')
        .update(codeVerifier)
        .digest('base64url'),
      code_challenge_method: 'S256',
    });
  });

  it('구글은 구글 인가 주소와 scope를 쓴다', async () => {
    const response = await callGet('google');
    const location = new URL(response.headers.get('location') ?? '');

    expect(`${location.origin}${location.pathname}`).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    expect(location.searchParams.get('client_id')).toBe('google-client');
    expect(location.searchParams.get('redirect_uri')).toBe(
      'http://localhost:3000/oauth/google',
    );
    expect(location.searchParams.get('scope')).toBe('openid email profile');
  });

  it('시작할 때마다 state·code_verifier를 새로 만든다', async () => {
    await callGet('kakao');
    await callGet('kakao');
    const [[, first], [, second]] = vi.mocked(setOAuthRequestCookies).mock
      .calls;

    expect(first.state).not.toBe(second.state);
    expect(first.codeVerifier).not.toBe(second.codeVerifier);
  });

  it.each(['KAKAO_CLIENT_ID', 'OAUTH_REDIRECT_ORIGIN'])(
    '%s가 없으면 임시 쿠키를 저장하지 않고 실패한다',
    async (name) => {
      vi.stubEnv(name, '');

      await expect(callGet('kakao')).rejects.toThrow(name);
      expect(setOAuthRequestCookies).not.toHaveBeenCalled();
    },
  );
});
