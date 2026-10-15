import { QueryClient, dehydrate } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  staffDetailQueryOptions,
  staffEditQueryOptions,
  staffKeys,
  staffListQueryOptions,
} from '@hooks/api/staff/staffQueryOptions';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { getStaffList } from '@lib/api/entities/staff/api';

vi.mock('@lib/api/entities/staff/api', () => ({
  getStaffList: vi.fn(),
  getStaffDetail: vi.fn(),
}));
afterEach(() => vi.resetAllMocks());

describe('staffQueryOptions', () => {
  it('수정 폼의 초기 치명적 오류는 경계로 보내고 재조회 실패는 폼을 유지한다', () => {
    const client = new QueryClient();
    const options = staffEditQueryOptions(42);
    const query = client.getQueryCache().build(client, {
      ...options,
      queryKey: staffKeys.detail(42),
    });
    const throwOnError = options.throwOnError;
    if (typeof throwOnError !== 'function')
      throw new Error('throwOnError must be a function');
    for (const error of [
      new ApiError('FORBIDDEN', 403),
      new Error('HTTP 500'),
      new NetworkError(),
    ]) {
      expect(throwOnError(error, query)).toBe(true);
    }
    query.setData({
      id: 42,
      name: '김알바',
      createdAt: '2026-10-14T09:00:00+09:00',
      attachments: [],
    });
    for (const error of [
      new ApiError('FORBIDDEN', 403),
      new Error('HTTP 500'),
      new NetworkError(),
    ]) {
      expect(throwOnError(error, query)).toBe(false);
    }
    client.clear();
  });

  it('서버 인증 헤더를 요청에 전달하고 hydration 데이터에는 넣지 않는다', async () => {
    const params = { page: 1, size: 10 };
    const list = { page: 1, size: 10, items: [], totalCount: 0, totalPage: 0 };
    vi.mocked(getStaffList).mockResolvedValue(list);
    const client = new QueryClient();
    try {
      await client.prefetchQuery(
        staffListQueryOptions(params, {
          headers: { Authorization: 'Bearer private-access-token' },
        }),
      );
      expect(getStaffList).toHaveBeenCalledWith(
        params,
        expect.objectContaining({
          headers: { Authorization: 'Bearer private-access-token' },
          signal: expect.any(AbortSignal),
        }),
      );
      expect(staffListQueryOptions(params).queryKey).toEqual(
        staffKeys.list(params),
      );
      expect(JSON.stringify(dehydrate(client))).not.toContain(
        'private-access-token',
      );
    } finally {
      client.clear();
    }
  });

  it('4xx는 재시도하지 않고 서버·네트워크 오류만 최대 3회 재시도한다', () => {
    const retry = staffDetailQueryOptions(42).retry;
    if (typeof retry !== 'function')
      throw new Error('retry must be a function');
    expect(retry(0, new ApiError('STAFF_NOT_FOUND', 404))).toBe(false);
    expect(retry(2, new NetworkError())).toBe(true);
    expect(retry(3, new NetworkError())).toBe(false);
  });

  it('핵심 조회의 403·서버 오류는 경계로 보내고 400·404는 인라인으로 처리한다', () => {
    const throwOnError = staffListQueryOptions().throwOnError;
    if (typeof throwOnError !== 'function')
      throw new Error('throwOnError must be a function');
    const query = {} as Parameters<typeof throwOnError>[1];
    expect(throwOnError(new ApiError('FORBIDDEN', 403), query)).toBe(true);
    expect(throwOnError(new Error('server error'), query)).toBe(true);
    expect(throwOnError(new ApiError('BAD_REQUEST', 400), query)).toBe(false);
    expect(throwOnError(new ApiError('STAFF_NOT_FOUND', 404), query)).toBe(
      false,
    );
  });
});
