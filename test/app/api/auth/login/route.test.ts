// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@lib/api/apiError';
import { setAuthCookies } from '@lib/api/bff/authCookies';
import { login1 } from '@lib/api/generated/auth/auth';

import { POST } from '@app/api/auth/login/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/authCookies', () => ({ setAuthCookies: vi.fn() }));
vi.mock('@lib/api/generated/auth/auth', () => ({ login1: vi.fn() }));

const USER = { id: 1, email: 'owner@bizsched.app', name: '사장님' };

const createRequest = (body: unknown) =>
  new Request('https://bizsched.app/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: 'https://bizsched.app',
      Host: 'bizsched.app',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });

const callPost = (request: Request) =>
  POST(request, { params: Promise.resolve({}) });

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.mocked(login1).mockReset();
    vi.mocked(setAuthCookies).mockReset();
  });

  it('토큰을 쿠키로 저장하고 user만 돌려준다', async () => {
    vi.mocked(login1).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: USER,
    });

    const response = await callPost(
      createRequest({ email: USER.email, password: 'pw', autoLogin: true }),
    );

    expect(login1).toHaveBeenCalledWith({
      email: USER.email,
      password: 'pw',
      autoLogin: true,
    });
    expect(setAuthCookies).toHaveBeenCalledWith({
      accessToken: 'access',
      refreshToken: 'refresh',
      autoLogin: true,
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ user: USER });
  });

  it('autoLogin이 없으면 false로 저장한다', async () => {
    vi.mocked(login1).mockResolvedValue({
      accessToken: 'access',
      refreshToken: 'refresh',
      user: USER,
    });

    await callPost(createRequest({ email: USER.email, password: 'pw' }));

    expect(setAuthCookies).toHaveBeenCalledWith(
      expect.objectContaining({ autoLogin: false }),
    );
  });

  it.each([
    ['필수 필드 누락', { email: USER.email }],
    ['JSON이 아닌 body', 'not-json'],
  ])('%s이면 BE를 부르지 않고 400을 돌려준다', async (_, body) => {
    const response = await callPost(createRequest(body));

    expect(login1).not.toHaveBeenCalled();
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'VALIDATION_ERROR',
    });
  });

  it('BE 로그인 실패는 쿠키를 저장하지 않고 그대로 전달한다', async () => {
    vi.mocked(login1).mockRejectedValue(
      new ApiError('INVALID_CREDENTIALS', 401, '로그인 실패'),
    );

    const response = await callPost(
      createRequest({ email: USER.email, password: 'wrong' }),
    );

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'INVALID_CREDENTIALS',
    });
  });

  it('BE 응답이 스키마와 다르면 쿠키를 저장하지 않고 502를 돌려준다', async () => {
    vi.mocked(login1).mockResolvedValue({ user: USER } as never);

    const response = await callPost(
      createRequest({ email: USER.email, password: 'pw' }),
    );

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'BFF_INVALID_UPSTREAM_RESPONSE',
    });
  });

  it('Origin이 다르면 403을 돌려준다', async () => {
    const request = new Request('https://bizsched.app/api/auth/login', {
      method: 'POST',
      headers: { Origin: 'https://evil.com', Host: 'bizsched.app' },
      body: JSON.stringify({ email: USER.email, password: 'pw' }),
    });

    const response = await callPost(request);

    expect(login1).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });
});
