// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { setAuthCookies } from '@lib/api/bff/authCookies';
import { clearTempToken, getTempToken } from '@lib/api/bff/oauthCookies';
import { customFetcher } from '@lib/api/customFetcher';

import { PATCH } from '@app/api/users/signup/additional-info/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/authCookies', () => ({ setAuthCookies: vi.fn() }));
vi.mock('@lib/api/bff/oauthCookies', () => ({
  clearTempToken: vi.fn(),
  getTempToken: vi.fn(),
}));
vi.mock('@lib/api/customFetcher', () => ({ customFetcher: vi.fn() }));

const REQUEST_BODY = {
  industry: 'BAKERY',
  termsAgreed: [
    { termsId: 1, agreed: true },
    { termsId: 5, agreed: false },
  ],
};

const USER = {
  id: 1,
  email: 'owner@bizsched.app',
  industry: 'BAKERY',
  industryDetail: null,
};

const createRequest = (body: unknown) =>
  new Request('https://bizsched.app/api/users/signup/additional-info', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://bizsched.app',
      Host: 'bizsched.app',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const callPatch = (request: Request) =>
  PATCH(request, { params: Promise.resolve({}) });

describe('PATCH /api/users/signup/additional-info', () => {
  beforeEach(() => {
    vi.mocked(setAuthCookies).mockReset();
    vi.mocked(clearTempToken).mockReset();
    vi.mocked(getTempToken).mockReset();
    vi.mocked(getTempToken).mockResolvedValue('temp');
    vi.mocked(customFetcher).mockReset();
  });

  it('temp_token을 Bearer로 보내고, 정식 토큰을 세션 쿠키로 저장한 뒤 사용자 정보만 돌려준다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({
      ...USER,
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    const response = await callPatch(createRequest(REQUEST_BODY));

    expect(customFetcher).toHaveBeenCalledWith(
      '/api/users/signup/additional-info',
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer temp' }),
        body: JSON.stringify(REQUEST_BODY),
      }),
    );
    expect(setAuthCookies).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: false,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(USER);
  });

  it('성공 시 temp_token 삭제는 setAuthCookies에 맡기고 따로 부르지 않는다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({
      ...USER,
      accessToken: 'access',
      refreshToken: 'refresh',
    });

    await callPatch(createRequest(REQUEST_BODY));

    expect(clearTempToken).not.toHaveBeenCalled();
  });

  it.each(['BAKERY', 'PUB', 'CONVENIENCE_STORE'])(
    '일반 가입 업종 값 %s를 받는다',
    async (industry) => {
      vi.mocked(customFetcher).mockResolvedValue({
        ...USER,
        industry,
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      const response = await callPatch(
        createRequest({ ...REQUEST_BODY, industry }),
      );

      expect(response.status).toBe(200);
    },
  );

  it.each([
    ['옛 업종 값', { ...REQUEST_BODY, industry: 'RETAIL' }],
    ['약관 누락', { industry: 'CAFE' }],
    ['JSON이 아닌 body', 'not-json'],
  ])('%s이면 BE를 부르지 않고 400을 돌려준다', async (_, body) => {
    const response = await callPatch(createRequest(body));

    expect(customFetcher).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'VALIDATION_ERROR',
    });
  });

  it('temp_token이 없으면 BE를 부르지 않고 401 INVALID_TEMP_TOKEN을 돌려준다', async () => {
    vi.mocked(getTempToken).mockResolvedValue(undefined);

    const response = await callPatch(createRequest(REQUEST_BODY));

    expect(customFetcher).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'INVALID_TEMP_TOKEN',
    });
  });

  it.each([
    [401, 'INVALID_TEMP_TOKEN'],
    [409, 'SOCIAL_ACCOUNT_ALREADY_REGISTERED'],
    [409, 'SOCIAL_EMAIL_CONFLICT'],
  ])(
    '%i %s는 같은 임시 토큰으로 다시 성공할 수 없으므로 temp_token을 지우고 전달한다',
    async (status, errorCode) => {
      vi.mocked(customFetcher).mockRejectedValue(
        new ApiError(errorCode, status),
      );

      const response = await callPatch(createRequest(REQUEST_BODY));

      expect(clearTempToken).toHaveBeenCalledOnce();
      expect(setAuthCookies).not.toHaveBeenCalled();
      expect(response.status).toBe(status);
      await expect(response.json()).resolves.toMatchObject({ errorCode });
    },
  );

  it('409 SOCIAL_EMAIL_CONFLICT의 data(joinType)를 함께 전달한다', async () => {
    vi.mocked(customFetcher).mockRejectedValue(
      new ApiError('SOCIAL_EMAIL_CONFLICT', 409, '', { joinType: 'EMAIL' }),
    );

    const response = await callPatch(createRequest(REQUEST_BODY));

    await expect(response.json()).resolves.toMatchObject({
      data: { joinType: 'EMAIL' },
    });
  });

  it.each([
    ['400 입력 오류', new ApiError('REQUIRED_TERMS_NOT_AGREED', 400)],
    ['다른 401', new ApiError('UNAUTHORIZED', 401)],
    ['status가 다른 같은 코드', new ApiError('INVALID_TEMP_TOKEN', 400)],
    ['네트워크 실패', new NetworkError()],
  ])(
    '%s는 입력을 고쳐 다시 제출할 수 있도록 temp_token을 유지한다',
    async (_, error) => {
      vi.mocked(customFetcher).mockRejectedValue(error);

      await callPatch(createRequest(REQUEST_BODY));

      expect(clearTempToken).not.toHaveBeenCalled();
    },
  );

  it('BE 응답이 스키마와 다르면 쿠키를 저장하지 않고 502를 돌려준다', async () => {
    vi.mocked(customFetcher).mockResolvedValue(USER);

    const response = await callPatch(createRequest(REQUEST_BODY));

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(502);
  });

  it('Origin이 다르면 403을 돌려준다', async () => {
    const request = new Request(
      'https://bizsched.app/api/users/signup/additional-info',
      {
        method: 'PATCH',
        headers: { Origin: 'https://evil.com', Host: 'bizsched.app' },
        body: JSON.stringify(REQUEST_BODY),
      },
    );

    const response = await callPatch(request);

    expect(getTempToken).not.toHaveBeenCalled();
    expect(customFetcher).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });
});
