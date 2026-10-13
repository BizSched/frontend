// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@lib/api/apiError';
import { clearAuthCookies } from '@lib/api/bff/authCookies';
import { logout } from '@lib/api/generated/auth/auth';

import { POST } from '@app/api/auth/logout/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/authCookies', () => ({ clearAuthCookies: vi.fn() }));
vi.mock('@lib/api/generated/auth/auth', () => ({ logout: vi.fn() }));
vi.mock('@lib/api/getAuthHeaders', () => ({
  getAuthHeaders: async () => ({ Authorization: 'Bearer access' }),
}));

const createRequest = (origin = 'https://bizsched.app') =>
  new Request('https://bizsched.app/api/auth/logout', {
    method: 'POST',
    headers: { Origin: origin, Host: 'bizsched.app' },
  });

const callPost = (request = createRequest()) =>
  POST(request, { params: Promise.resolve({}) });

describe('POST /api/auth/logout', () => {
  beforeEach(() => {
    vi.mocked(logout).mockReset();
    vi.mocked(clearAuthCookies).mockReset();
  });

  it('access 토큰으로 BE 로그아웃 후 쿠키를 지우고 204를 돌려준다', async () => {
    vi.mocked(logout).mockResolvedValue(undefined);

    const response = await callPost();

    expect(logout).toHaveBeenCalledWith({
      headers: { Authorization: 'Bearer access' },
    });
    expect(clearAuthCookies).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });

  it.each(['TOKEN_EXPIRED', 'UNAUTHORIZED'])(
    '쿠키만 지우면 BE refresh 토큰이 남으므로 BE가 401 %s를 주면 쿠키를 지우지 않고 401을 전달한다',
    async (errorCode) => {
      vi.mocked(logout).mockRejectedValue(new ApiError(errorCode, 401, ''));

      const response = await callPost();

      expect(clearAuthCookies).not.toHaveBeenCalled();
      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toMatchObject({ errorCode });
    },
  );

  it('Origin이 다르면 BE를 부르지 않고 403을 돌려준다', async () => {
    const response = await callPost(createRequest('https://evil.com'));

    expect(logout).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });
});
