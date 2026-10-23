// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { setAuthCookies } from '@lib/api/bff/authCookies';
import {
  clearOAuthRequestCookies,
  clearTempToken,
  getOAuthRequestCookies,
  setTempToken,
} from '@lib/api/bff/oauthCookies';
import { login } from '@lib/api/generated/oauth/oauth';

import { GET } from '@app/oauth/[provider]/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/authCookies', () => ({ setAuthCookies: vi.fn() }));
vi.mock('@lib/api/bff/oauthCookies', () => ({
  clearOAuthRequestCookies: vi.fn(),
  clearTempToken: vi.fn(),
  getOAuthRequestCookies: vi.fn(),
  setTempToken: vi.fn(),
}));
vi.mock('@lib/api/generated/oauth/oauth', () => ({ login: vi.fn() }));

const STORED_REQUEST = { state: 'stored-state', codeVerifier: 'verifier' };

const callGet = (provider: string, query: Record<string, string>) =>
  GET(
    new Request(
      `https://bizsched.app/oauth/${provider}?${new URLSearchParams(query)}`,
    ),
    { params: Promise.resolve({ provider }) },
  );

const callValidCallback = () =>
  callGet('kakao', { code: 'code', state: STORED_REQUEST.state });

const locationOf = (response: Response) => {
  const url = new URL(response.headers.get('location') ?? '');
  return `${url.pathname}${url.search}`;
};

describe('GET /oauth/[provider]', () => {
  beforeEach(() => {
    vi.mocked(setAuthCookies).mockReset();
    vi.mocked(clearOAuthRequestCookies).mockReset();
    vi.mocked(clearTempToken).mockReset();
    vi.mocked(getOAuthRequestCookies).mockReset();
    vi.mocked(getOAuthRequestCookies).mockResolvedValue(STORED_REQUEST);
    vi.mocked(setTempToken).mockReset();
    vi.mocked(login).mockReset();
  });

  describe('provider 검증', () => {
    it.each(['naver', 'unknown', 'Kakao'])(
      '허용 목록에 없는 %s는 쿠키를 건드리지 않고 404다',
      async (provider) => {
        const response = await callGet(provider, {
          code: 'code',
          state: STORED_REQUEST.state,
        });

        expect(response.status).toBe(404);
        expect(clearOAuthRequestCookies).not.toHaveBeenCalled();
        expect(login).not.toHaveBeenCalled();
      },
    );
  });

  describe('BE를 부르기 전 실패', () => {
    it('쿼리 error(동의 취소)는 문구 없이 /login으로 보내고 temp_token을 유지한다', async () => {
      const response = await callGet('kakao', {
        error: 'access_denied',
        state: STORED_REQUEST.state,
      });

      expect(response.status).toBe(303);
      expect(locationOf(response)).toBe('/login');
      expect(login).not.toHaveBeenCalled();
      expect(clearOAuthRequestCookies).toHaveBeenCalledWith('kakao');
      expect(clearTempToken).not.toHaveBeenCalled();
    });

    it.each([
      ['요청 쿠키가 없음', null, { code: 'code', state: 'stored-state' }],
      ['쿼리 state가 없음', STORED_REQUEST, { code: 'code' }],
      ['쿼리 state가 빈 값', STORED_REQUEST, { code: 'code', state: '' }],
      ['쿼리 code가 없음', STORED_REQUEST, { state: 'stored-state' }],
      [
        '쿼리 code가 빈 값',
        STORED_REQUEST,
        { code: '', state: 'stored-state' },
      ],
      ['state 불일치', STORED_REQUEST, { code: 'code', state: 'other-state' }],
    ])(
      '%s이면 BE를 부르지 않고 BFF_INVALID_OAUTH_STATE로 보낸다',
      async (_, stored, query) => {
        vi.mocked(getOAuthRequestCookies).mockResolvedValue(stored);

        const response = await callGet('kakao', query);

        expect(response.status).toBe(303);
        expect(locationOf(response)).toBe(
          '/login?socialError=BFF_INVALID_OAUTH_STATE',
        );
        expect(login).not.toHaveBeenCalled();
        expect(clearOAuthRequestCookies).toHaveBeenCalledWith('kakao');
        expect(clearTempToken).not.toHaveBeenCalled();
      },
    );
  });

  describe('BE 호출 성공', () => {
    it('저장한 code_verifier와 쿼리 code로 BE를 부른다', async () => {
      vi.mocked(login).mockResolvedValue({
        isNewUser: true,
        tempToken: 'temp',
      });

      await callGet('google', { code: 'auth-code', state: 'stored-state' });

      expect(login).toHaveBeenCalledWith('google', {
        authorizationCode: 'auth-code',
        codeVerifier: 'verifier',
      });
      expect(clearOAuthRequestCookies).toHaveBeenCalledWith('google');
    });

    it('기존 회원은 정식 토큰을 autoLogin false로 저장하고 /dashboard로 보낸다', async () => {
      vi.mocked(login).mockResolvedValue({
        isNewUser: false,
        tempToken: null,
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const response = await callValidCallback();

      expect(response.status).toBe(303);
      expect(locationOf(response)).toBe('/dashboard');
      expect(setAuthCookies).toHaveBeenCalledWith({
        accessToken: 'access',
        refreshToken: 'refresh',
        autoLogin: false,
      });
      expect(setTempToken).not.toHaveBeenCalled();
      expect(clearTempToken).not.toHaveBeenCalled();
      expect(clearOAuthRequestCookies).toHaveBeenCalledWith('kakao');
    });

    it('신규 사용자는 temp_token을 저장하고 /onboarding으로 보낸다', async () => {
      vi.mocked(login).mockResolvedValue({
        isNewUser: true,
        tempToken: 'temp',
        accessToken: null,
        refreshToken: null,
      });

      const response = await callValidCallback();

      expect(response.status).toBe(303);
      expect(locationOf(response)).toBe('/onboarding');
      expect(setTempToken).toHaveBeenCalledWith('temp');
      expect(setAuthCookies).not.toHaveBeenCalled();
      expect(clearOAuthRequestCookies).toHaveBeenCalledWith('kakao');
    });
  });

  describe('BE 호출 후 실패', () => {
    it.each([
      ['기존 회원 access 누락', { isNewUser: false, refreshToken: 'refresh' }],
      ['기존 회원 refresh 누락', { isNewUser: false, accessToken: 'access' }],
      [
        '기존 회원 토큰 빈 값',
        { isNewUser: false, accessToken: '', refreshToken: 'refresh' },
      ],
      ['신규 사용자 tempToken 누락', { isNewUser: true, tempToken: null }],
      ['신규 사용자 tempToken 빈 값', { isNewUser: true, tempToken: '' }],
      ['isNewUser 누락', { accessToken: 'access', refreshToken: 'refresh' }],
    ])(
      '%s이면 쿠키를 저장하지 않고 BFF_INVALID_UPSTREAM_RESPONSE로 보낸다',
      async (_, body) => {
        vi.mocked(login).mockResolvedValue(body as never);

        const response = await callValidCallback();

        expect(locationOf(response)).toBe(
          '/login?socialError=BFF_INVALID_UPSTREAM_RESPONSE',
        );
        expect(setAuthCookies).not.toHaveBeenCalled();
        expect(setTempToken).not.toHaveBeenCalled();
        expect(clearTempToken).toHaveBeenCalledOnce();
        expect(clearOAuthRequestCookies).toHaveBeenCalledWith('kakao');
      },
    );

    it('409 SOCIAL_EMAIL_CONFLICT는 BE의 joinType을 붙여 보낸다', async () => {
      vi.mocked(login).mockRejectedValue(
        new ApiError('SOCIAL_EMAIL_CONFLICT', 409, '', { joinType: 'EMAIL' }),
      );

      const response = await callValidCallback();

      expect(locationOf(response)).toBe(
        '/login?socialError=SOCIAL_EMAIL_CONFLICT&joinType=EMAIL',
      );
      expect(clearTempToken).toHaveBeenCalledOnce();
    });

    it.each([
      [
        'INVALID_AUTHORIZATION_CODE',
        new ApiError('INVALID_AUTHORIZATION_CODE', 400),
      ],
      [
        'BFF_UPSTREAM_TIMEOUT',
        new NetworkError({
          cause: new DOMException('timed out', 'TimeoutError'),
        }),
      ],
      [
        'BFF_UPSTREAM_UNAVAILABLE',
        new NetworkError({ cause: new TypeError('fetch failed') }),
      ],
      ['INTERNAL_SERVER_ERROR', new Error('HTTP 503')],
    ])(
      '%s 실패는 temp_token을 지우고 해당 errorCode로 보낸다',
      async (errorCode, error) => {
        vi.mocked(login).mockRejectedValue(error);

        const response = await callValidCallback();

        expect(response.status).toBe(303);
        expect(locationOf(response)).toBe(`/login?socialError=${errorCode}`);
        expect(clearTempToken).toHaveBeenCalledOnce();
        expect(clearOAuthRequestCookies).toHaveBeenCalledWith('kakao');
      },
    );
  });
});
