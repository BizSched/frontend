import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { customFetcher } from '@lib/api/customFetcher';
import { postLogin } from '@lib/api/entities/auth/api';

vi.mock('@lib/api/customFetcher', () => ({ customFetcher: vi.fn() }));

const USER = { id: 1, email: 'owner@bizsched.app', name: '사장님' };

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
