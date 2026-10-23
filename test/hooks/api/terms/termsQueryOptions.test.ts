import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  termsKeys,
  termsQueryOptions,
} from '@hooks/api/terms/termsQueryOptions';

import { getTerms } from '@lib/api/entities/terms/api';

vi.mock('@lib/api/entities/terms/api', () => ({ getTerms: vi.fn() }));

describe('termsQueryOptions', () => {
  beforeEach(() => {
    vi.mocked(getTerms).mockReset();
  });

  it('서버 prefetch에 캐시 옵션과 취소 signal을 전달한다', async () => {
    vi.mocked(getTerms).mockResolvedValue([]);
    const client = new QueryClient();
    await client.prefetchQuery(
      termsQueryOptions({ next: { revalidate: 3600 } }),
    );
    expect(getTerms).toHaveBeenCalledWith({
      next: { revalidate: 3600 },
      signal: expect.any(AbortSignal),
    });
    expect(client.getQueryData(termsKeys.list())).toEqual([]);
  });

  it('실패한 prefetch는 페이지를 중단하지 않고 성공 데이터로 저장하지 않는다', async () => {
    vi.mocked(getTerms).mockRejectedValue(new Error('offline'));
    const client = new QueryClient();
    await expect(
      client.prefetchQuery(termsQueryOptions()),
    ).resolves.toBeUndefined();
    expect(client.getQueryData(termsKeys.list())).toBeUndefined();
    expect(termsQueryOptions().throwOnError).toBe(false);
  });
});
