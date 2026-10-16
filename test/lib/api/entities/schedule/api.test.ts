import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { getScheduleList } from '@lib/api/entities/schedule/api';
import { findAll2 } from '@lib/api/generated/schedule/schedule';

vi.mock('@lib/api/generated/schedule/schedule', () => ({
  findAll2: vi.fn(),
}));

const createItem = (id: number, memo: string | null = null) => ({
  id,
  staff: { id: 7, name: '김알바', isDeleted: false },
  workDate: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: false,
  memo,
  createdAt: '2026-10-01T09:00:00+09:00',
  updatedAt: '2026-10-01T09:00:00+09:00',
});

const createPage = (page: number, totalPage: number, ids: number[]) => ({
  page,
  size: 100,
  totalCount: ids.length,
  totalPage,
  items: ids.map((id) => createItem(id)),
});

beforeEach(() => vi.resetAllMocks());

describe('schedule API', () => {
  it('DTO를 FE 타입으로 바꾸고 빈 메모는 빈 문자열로 둔다', async () => {
    vi.mocked(findAll2).mockResolvedValue({
      ...createPage(1, 1, []),
      items: [createItem(1), createItem(2, '오픈')],
    });
    const options = { headers: { Authorization: 'Bearer access' } };

    await expect(
      getScheduleList({ from: '2026-09-28', to: '2026-11-01' }, options),
    ).resolves.toEqual([
      {
        id: 1,
        staff: { id: 7, name: '김알바', isDeleted: false },
        date: '2026-10-14',
        startTime: '09:00',
        endTime: '13:00',
        isCheckedIn: false,
        memo: '',
      },
      expect.objectContaining({ id: 2, memo: '오픈' }),
    ]);
    expect(findAll2).toHaveBeenCalledWith(
      { from: '2026-09-28', to: '2026-11-01', page: 1, size: 100 },
      options,
    );
  });

  it('totalPage까지 이어 받아 순서대로 합친다', async () => {
    vi.mocked(findAll2).mockImplementation(async ({ page }) =>
      page === 1
        ? createPage(1, 3, [1, 2])
        : page === 2
          ? createPage(2, 3, [3])
          : createPage(3, 3, [4]),
    );

    const schedules = await getScheduleList({
      from: '2026-09-28',
      to: '2026-11-01',
      staffId: 7,
    });

    expect(schedules.map(({ id }) => id)).toEqual([1, 2, 3, 4]);
    expect(findAll2).toHaveBeenCalledTimes(3);
    expect(findAll2).toHaveBeenLastCalledWith(
      expect.objectContaining({ staffId: 7, page: 3, size: 100 }),
      undefined,
    );
  });

  it('결과가 없으면 첫 페이지만 요청한다', async () => {
    vi.mocked(findAll2).mockResolvedValue(createPage(1, 0, []));

    await expect(
      getScheduleList({ from: '2026-09-28', to: '2026-11-01' }),
    ).resolves.toEqual([]);
    expect(findAll2).toHaveBeenCalledTimes(1);
  });

  it('깨진 응답은 검증에서 막는다', async () => {
    vi.mocked(findAll2).mockResolvedValue({
      ...createPage(1, 1, []),
      items: [{ ...createItem(1), workDate: '10/14' }],
    } as never);

    await expect(
      getScheduleList({ from: '2026-09-28', to: '2026-11-01' }),
    ).rejects.toBeInstanceOf(ZodError);
  });
});
