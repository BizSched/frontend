// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getAuthHeaders } from '@lib/api/getAuthHeaders';

const cookieValues = new Map<string, string>();

vi.mock('server-only', () => ({}));
vi.mock('next/headers', () => ({
  cookies: async () => ({
    get: (name: string) => {
      const value = cookieValues.get(name);
      return value === undefined ? undefined : { name, value };
    },
  }),
}));

describe('getAuthHeaders', () => {
  beforeEach(() => {
    cookieValues.clear();
  });

  it('access 쿠키가 있으면 Bearer Authorization 헤더를 만든다', async () => {
    cookieValues.set('access_token', 'access-token-value');

    await expect(getAuthHeaders()).resolves.toEqual({
      Authorization: 'Bearer access-token-value',
    });
  });

  it('access 쿠키가 없으면 빈 헤더를 돌려준다', async () => {
    await expect(getAuthHeaders()).resolves.toEqual({});
  });
});
