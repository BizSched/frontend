// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@lib/api/apiError';
import { getAuthCookies, setAuthCookies } from '@lib/api/bff/authCookies';
import { refresh } from '@lib/api/generated/auth/auth';

import { POST } from '@app/api/auth/refresh/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/authCookies', () => ({
  getAuthCookies: vi.fn(),
  setAuthCookies: vi.fn(),
}));
vi.mock('@lib/api/generated/auth/auth', () => ({ refresh: vi.fn() }));

const createRequest = () =>
  new Request('https://bizsched.app/api/auth/refresh', {
    method: 'POST',
    headers: { Origin: 'https://bizsched.app', Host: 'bizsched.app' },
  });

const callPost = () => POST(createRequest(), { params: Promise.resolve({}) });

describe('POST /api/auth/refresh', () => {
  beforeEach(() => {
    vi.mocked(refresh).mockReset();
    vi.mocked(setAuthCookies).mockReset();
    vi.mocked(getAuthCookies).mockResolvedValue({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      autoLogin: true,
    });
  });

  it('refresh 쿠키로 재발급하고 두 토큰을 auto_login 수명으로 다시 저장한다', async () => {
    vi.mocked(refresh).mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const response = await callPost();

    expect(refresh).toHaveBeenCalledWith({ refreshToken: 'old-refresh' });
    expect(setAuthCookies).toHaveBeenCalledWith({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      autoLogin: true,
    });
    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe('');
  });

  it('refresh 쿠키가 없으면 BE를 부르지 않고 401 UNAUTHORIZED를 돌려준다', async () => {
    vi.mocked(getAuthCookies).mockResolvedValue({ autoLogin: false });

    const response = await callPost();

    expect(refresh).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'UNAUTHORIZED',
    });
  });

  it('다른 탭이 이미 새 쿠키를 받았을 수 있으므로 BE refresh가 실패해도 쿠키를 바꾸지 않고 실패를 전달한다', async () => {
    vi.mocked(refresh).mockRejectedValue(
      new ApiError('INVALID_REFRESH_TOKEN', 401, '만료된 토큰'),
    );

    const response = await callPost();

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'INVALID_REFRESH_TOKEN',
    });
  });

  it('BE 동시 refresh 500도 쿠키를 바꾸지 않고 실패를 전달한다', async () => {
    vi.mocked(refresh).mockRejectedValue(new Error('HTTP 500'));

    const response = await callPost();

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(500);
  });

  it('BE 응답이 스키마와 다르면 쿠키를 저장하지 않고 502를 돌려준다', async () => {
    vi.mocked(refresh).mockResolvedValue({ accessToken: 'only' } as never);

    const response = await callPost();

    expect(setAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(502);
  });
});
