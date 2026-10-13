// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthCookies } from '@lib/api/bff/authCookies';

import { DELETE } from '@app/api/auth/session/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/bff/authCookies', () => ({ clearAuthCookies: vi.fn() }));

const createRequest = (origin: string) =>
  new Request('https://bizsched.app/api/auth/session', {
    method: 'DELETE',
    headers: { Origin: origin, Host: 'bizsched.app' },
  });

describe('DELETE /api/auth/session', () => {
  beforeEach(() => {
    vi.mocked(clearAuthCookies).mockReset();
  });

  it('BE를 부르지 않고 쿠키만 지운 뒤 204를 돌려준다', async () => {
    const response = await DELETE(createRequest('https://bizsched.app'), {
      params: Promise.resolve({}),
    });

    expect(clearAuthCookies).toHaveBeenCalled();
    expect(response.status).toBe(204);
  });

  it('Origin이 다르면 쿠키를 지우지 않고 403을 돌려준다', async () => {
    const response = await DELETE(createRequest('https://evil.com'), {
      params: Promise.resolve({}),
    });

    expect(clearAuthCookies).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
  });
});
