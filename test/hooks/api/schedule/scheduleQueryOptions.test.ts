import { QueryClient } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  scheduleKeys,
  scheduleListQueryOptions,
} from '@hooks/api/schedule/scheduleQueryOptions';
import { staffKeys } from '@hooks/api/staff/staffQueryOptions';

import { getScheduleList } from '@lib/api/entities/schedule/api';

vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(),
}));
vi.mock('@lib/api/entities/staff/api', () => ({}));
afterEach(() => vi.resetAllMocks());

describe('scheduleQueryOptions', () => {
  it('Query Key는 from·to·staffId이고 전체 조회는 staffId를 null로 둔다', () => {
    expect(
      scheduleListQueryOptions({ from: '2026-09-28', to: '2026-11-01' })
        .queryKey,
    ).toEqual([
      'schedule',
      'list',
      { from: '2026-09-28', to: '2026-11-01', staffId: null },
    ]);
    expect(
      scheduleKeys.list({ from: '2026-10-12', to: '2026-10-18', staffId: 7 }),
    ).toEqual([
      'schedule',
      'list',
      { from: '2026-10-12', to: '2026-10-18', staffId: 7 },
    ]);
  });

  it('스케쥴 조회 전체 무효화는 캘린더와 주간 근무 쿼리를 함께 갱신 대상으로 잡는다', async () => {
    vi.mocked(getScheduleList).mockResolvedValue([]);
    const client = new QueryClient();
    try {
      await client.prefetchQuery(
        scheduleListQueryOptions({ from: '2026-09-28', to: '2026-11-01' }),
      );
      await client.prefetchQuery(
        scheduleListQueryOptions({
          from: '2026-10-12',
          to: '2026-10-18',
          staffId: 7,
        }),
      );
      await client.invalidateQueries({
        queryKey: scheduleKeys.all,
        refetchType: 'none',
      });
      expect(
        client
          .getQueryCache()
          .findAll({ queryKey: scheduleKeys.all })
          .every(({ state }) => state.isInvalidated),
      ).toBe(true);
      expect(client.getQueryCache().findAll()).toHaveLength(2);
    } finally {
      client.clear();
    }
  });

  it('필터·모달 아르바이트생 옵션은 아르바이트생 목록 무효화 범위에 포함된다', () => {
    const lists = staffKeys.lists();
    expect(staffKeys.options().slice(0, lists.length)).toEqual(lists);
    expect(staffKeys.options('EMPLOYED')).not.toEqual(staffKeys.options());
  });
});
