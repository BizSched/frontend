import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { customFetcher } from '@lib/api/customFetcher';
import { getTerms } from '@lib/api/entities/terms/api';

vi.mock('@lib/api/customFetcher', () => ({ customFetcher: vi.fn() }));

describe('getTerms', () => {
  beforeEach(() => {
    vi.mocked(customFetcher).mockReset();
  });

  it('생성 요청 함수로 조회하고 검증한 목록을 반환한다', async () => {
    const items = [
      { id: 8, title: '이용약관', required: true, content: '본문' },
    ];
    vi.mocked(customFetcher).mockResolvedValue({ items });
    const options = { next: { revalidate: 3600 } };
    await expect(getTerms(options)).resolves.toEqual(items);
    expect(customFetcher).toHaveBeenCalledWith('/api/terms', {
      ...options,
      method: 'GET',
    });
  });

  it('빈 목록은 정상 응답이다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({ items: [] });
    await expect(getTerms()).resolves.toEqual([]);
  });

  it.each([
    { items: [{}] },
    { items: [{ id: 1, title: '약관', required: 'true', content: '본문' }] },
    {},
  ])('잘못된 응답을 거부한다: %j', async (response) => {
    vi.mocked(customFetcher).mockResolvedValue(response);
    await expect(getTerms()).rejects.toBeInstanceOf(ZodError);
  });
});
