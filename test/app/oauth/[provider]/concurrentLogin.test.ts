// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { login } from '@lib/api/generated/oauth/oauth';

import { GET as authorize } from '@app/api/oauth/[provider]/authorize/route';
import { GET as callback } from '@app/oauth/[provider]/route';

const cookieJar = new Map<string, string>();

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieJar.get(name);
      return value === undefined ? undefined : { name, value };
    },
    has: (name: string) => cookieJar.has(name),
    set: (name: string, value: string, options?: { maxAge?: number }) => {
      if (options?.maxAge === 0) cookieJar.delete(name);
      else cookieJar.set(name, value);
    },
  }),
}));
vi.mock('@lib/api/generated/oauth/oauth', () => ({ login: vi.fn() }));

const params = { params: Promise.resolve({ provider: 'kakao' }) };

const startLogin = async () => {
  const response = await authorize(
    new Request('https://bizsched.app/api/oauth/kakao/authorize'),
    params,
  );
  const location = new URL(response.headers.get('location') ?? '');

  return location.searchParams.get('state') ?? '';
};

const finishLogin = async (state: string) => {
  const response = await callback(
    new Request(`https://bizsched.app/oauth/kakao?code=code&state=${state}`),
    params,
  );
  const url = new URL(response.headers.get('location') ?? '');

  return `${url.pathname}${url.search}`;
};

describe('같은 제공자의 동시 로그인', () => {
  beforeEach(() => {
    cookieJar.clear();
    vi.mocked(login).mockReset();
    vi.mocked(login).mockResolvedValue({ isNewUser: true, tempToken: 'temp' });
    vi.stubEnv('KAKAO_CLIENT_ID', 'kakao-client');
    vi.stubEnv('OAUTH_REDIRECT_ORIGIN', 'http://localhost:3000');
  });

  it('지원하지 않는다. A 시작 → B 시작 → A 콜백 → B 콜백이면 두 시도 모두 실패한다', async () => {
    const stateA = await startLogin();
    const stateB = await startLogin();

    await expect(finishLogin(stateA)).resolves.toBe(
      '/login?socialError=BFF_INVALID_OAUTH_STATE',
    );
    await expect(finishLogin(stateB)).resolves.toBe(
      '/login?socialError=BFF_INVALID_OAUTH_STATE',
    );
    expect(login).not.toHaveBeenCalled();
  });

  it('A 시작 → B 시작 → B 콜백이면 마지막 시도만 성공한다', async () => {
    await startLogin();
    const stateB = await startLogin();

    await expect(finishLogin(stateB)).resolves.toBe('/onboarding');
    expect(login).toHaveBeenCalledOnce();
  });

  it('콜백 뒤에는 요청 쿠키가 남지 않아 같은 state로 다시 들어와도 실패한다', async () => {
    const state = await startLogin();

    await expect(finishLogin(state)).resolves.toBe('/onboarding');
    await expect(finishLogin(state)).resolves.toBe(
      '/login?socialError=BFF_INVALID_OAUTH_STATE',
    );
    expect(login).toHaveBeenCalledOnce();
  });
});
