import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { ApiError } from '@lib/api/apiError';
import { customFetcher } from '@lib/api/customFetcher';
import {
  type CompleteSocialSignupRequest,
  patchCompleteSocialSignup,
  postLogin,
  postLogout,
  postSignup,
} from '@lib/api/entities/auth/api';
import type { SignupRequest } from '@lib/api/generated/bizSchedAPI.schemas';

vi.mock('@lib/api/customFetcher', () => ({ customFetcher: vi.fn() }));

const USER = { id: 1, email: 'owner@bizsched.app', name: '사장님' };

const SIGNUP_REQUEST: SignupRequest = {
  name: USER.name,
  email: USER.email,
  password: 'abcd1234',
  industry: 'CAFE',
  termsAgreed: [
    { termsId: 42, agreed: true },
    { termsId: 19, agreed: false },
  ],
};
const SIGNUP_RESPONSE = {
  ...USER,
  industry: 'CAFE',
  industryDetail: null,
  createdAt: '2026-10-14T00:00:00Z',
};

describe('postSignup', () => {
  beforeEach(() => {
    vi.mocked(customFetcher).mockReset();
  });

  it('생성 함수로 범용 BFF 경로에 요청하고 응답을 검증한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue(SIGNUP_RESPONSE);
    await expect(postSignup(SIGNUP_REQUEST)).resolves.toEqual(SIGNUP_RESPONSE);
    expect(customFetcher).toHaveBeenCalledWith('/api/users/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: USER.email,
        password: 'abcd1234',
        name: USER.name,
        industry: 'CAFE',
        termsAgreed: SIGNUP_REQUEST.termsAgreed,
      }),
    });
  });

  it('CUSTOM 요청의 직접 입력 업종을 전달한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({
      ...SIGNUP_RESPONSE,
      industry: 'CUSTOM',
      industryDetail: '꽃집',
    });
    await postSignup({
      ...SIGNUP_REQUEST,
      industry: 'CUSTOM',
      industryDetail: '꽃집',
    });
    expect(
      JSON.parse(vi.mocked(customFetcher).mock.calls[0][1]!.body as string),
    ).toMatchObject({ industry: 'CUSTOM', industryDetail: '꽃집' });
  });

  it.each([
    {},
    { ...SIGNUP_RESPONSE, createdAt: 'invalid' },
    { ...SIGNUP_RESPONSE, industry: 'RETAIL' },
  ])('가입 응답이 계약과 다르면 거부한다: %s', async (response) => {
    vi.mocked(customFetcher).mockResolvedValue(response);
    await expect(postSignup(SIGNUP_REQUEST)).rejects.toBeInstanceOf(ZodError);
  });

  it('잘못된 요청 구조는 HTTP 요청 전에 거부한다', async () => {
    await expect(
      postSignup({
        ...SIGNUP_REQUEST,
        industry: 'RETAIL',
      } as unknown as SignupRequest),
    ).rejects.toBeInstanceOf(ZodError);
    expect(customFetcher).not.toHaveBeenCalled();
  });

  it('BE 오류를 폼에서 처리할 수 있도록 그대로 전달한다', async () => {
    const error = new ApiError('EMAIL_ALREADY_EXISTS', 409);
    vi.mocked(customFetcher).mockRejectedValue(error);
    await expect(postSignup(SIGNUP_REQUEST)).rejects.toBe(error);
  });
});

describe('postLogin', () => {
  beforeEach(() => {
    vi.mocked(customFetcher).mockReset();
  });

  it('BFF 로그인 경로로 요청하고 user를 DAO로 돌려준다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({ user: USER });

    await expect(
      postLogin({ email: USER.email, password: 'pw', autoLogin: true }),
    ).resolves.toEqual(USER);
    expect(customFetcher).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: USER.email,
        password: 'pw',
        autoLogin: true,
      }),
    });
  });

  it('응답에 user가 없으면 ZodError를 던진다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({});

    await expect(
      postLogin({ email: USER.email, password: 'pw' }),
    ).rejects.toBeInstanceOf(ZodError);
  });
});

describe('postLogout', () => {
  beforeEach(() => {
    vi.mocked(customFetcher).mockReset();
  });

  it('BFF 로그아웃 경로로 POST 요청한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue(undefined);

    await expect(postLogout()).resolves.toBeUndefined();
    expect(customFetcher).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
    });
  });
});

describe('patchCompleteSocialSignup', () => {
  const request: CompleteSocialSignupRequest = {
    industry: 'CAFE',
    termsAgreed: SIGNUP_REQUEST.termsAgreed,
  };
  const response = {
    id: USER.id,
    email: USER.email,
    industry: 'CAFE',
    industryDetail: null,
  };

  beforeEach(() => {
    vi.mocked(customFetcher).mockReset();
  });

  it('토큰 없는 BFF 응답을 검증하고 PATCH 요청으로 업종과 약관만 보낸다', async () => {
    vi.mocked(customFetcher).mockResolvedValue(response);

    await expect(patchCompleteSocialSignup(request)).resolves.toEqual(response);
    expect(customFetcher).toHaveBeenCalledWith(
      '/api/users/signup/additional-info',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      },
    );
  });

  it.each(['BAKERY', 'PUB', 'CONVENIENCE_STORE'] as const)(
    '소셜 가입 명세의 옛 enum 대신 일반 가입 업종 %s를 전송한다',
    async (industry) => {
      vi.mocked(customFetcher).mockResolvedValue({ ...response, industry });

      await patchCompleteSocialSignup({ ...request, industry });

      expect(customFetcher).toHaveBeenCalledWith(
        '/api/users/signup/additional-info',
        expect.objectContaining({
          body: JSON.stringify({ ...request, industry }),
        }),
      );
    },
  );

  it('직접 입력 업종을 전달하고 응답에서 계약 밖 필드를 제외한다', async () => {
    const customResponse = {
      ...response,
      industry: 'CUSTOM',
      industryDetail: '꽃집',
    };
    vi.mocked(customFetcher).mockResolvedValue({
      ...customResponse,
      accessToken: 'unexpected-access',
      refreshToken: 'unexpected-refresh',
    });

    await expect(
      patchCompleteSocialSignup({
        ...request,
        industry: 'CUSTOM',
        industryDetail: '꽃집',
      }),
    ).resolves.toEqual(customResponse);
    expect(
      JSON.parse(vi.mocked(customFetcher).mock.calls[0][1]!.body as string),
    ).toEqual({
      ...request,
      industry: 'CUSTOM',
      industryDetail: '꽃집',
    });
  });

  it.each([{ ...request, industry: 'RETAIL' }, { industry: 'CAFE' }])(
    '잘못된 요청은 HTTP 호출 전에 거부한다: %s',
    async (invalidRequest) => {
      await expect(
        patchCompleteSocialSignup(
          invalidRequest as unknown as CompleteSocialSignupRequest,
        ),
      ).rejects.toBeInstanceOf(ZodError);
      expect(customFetcher).not.toHaveBeenCalled();
    },
  );

  it.each([{}, { ...response, industry: 'RETAIL' }, { ...response, id: '1' }])(
    '계약과 다른 응답은 거부한다: %s',
    async (invalidResponse) => {
      vi.mocked(customFetcher).mockResolvedValue(invalidResponse);

      await expect(patchCompleteSocialSignup(request)).rejects.toBeInstanceOf(
        ZodError,
      );
    },
  );

  it('오류의 status와 joinType을 화면에서 처리할 수 있게 보존한다', async () => {
    const error = new ApiError('SOCIAL_EMAIL_CONFLICT', 409, '', {
      joinType: 'EMAIL',
    });
    vi.mocked(customFetcher).mockRejectedValue(error);

    await expect(patchCompleteSocialSignup(request)).rejects.toBe(error);
  });
});
