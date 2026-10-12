// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@lib/api/apiError';
import { withBffHandler } from '@lib/api/bff/withBffHandler';

vi.mock('server-only', () => ({}));

const createRequest = (origin: string) =>
  new Request('http://10.0.0.5:3000/api/auth/login', {
    method: 'POST',
    headers: { Origin: origin, Host: 'bizsched.app' },
  });

describe('withBffHandler', () => {
  it('Origin이 맞으면 핸들러 응답을 그대로 돌려준다', async () => {
    const context = { params: Promise.resolve({}) };
    const handler = vi.fn(async () => Response.json({ ok: true }));

    const response = await withBffHandler(handler)(
      createRequest('https://bizsched.app'),
      context,
    );

    expect(handler).toHaveBeenCalledWith(expect.any(Request), context);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('Origin이 다르면 핸들러를 부르지 않고 403을 돌려준다', async () => {
    const handler = vi.fn(async () => Response.json({ ok: true }));

    const response = await withBffHandler(handler)(
      createRequest('https://evil.com'),
      undefined,
    );

    expect(handler).not.toHaveBeenCalled();
    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      errorCode: 'BFF_INVALID_ORIGIN',
    });
  });

  it('핸들러가 던진 에러를 BFF 에러 응답으로 바꾼다', async () => {
    const handler = vi.fn(async () => {
      throw new ApiError('INVALID_CREDENTIALS', 401, '로그인 실패');
    });

    const response = await withBffHandler(handler)(
      createRequest('https://bizsched.app'),
      undefined,
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: 401,
      message: '로그인 실패',
      errorCode: 'INVALID_CREDENTIALS',
    });
  });
});
