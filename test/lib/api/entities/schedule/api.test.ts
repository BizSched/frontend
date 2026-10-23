import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import {
  changeScheduleAttendance,
  createSchedule,
  deleteSchedule,
  getScheduleList,
  updateSchedule,
} from '@lib/api/entities/schedule/api';
import {
  changeAttendance,
  create2,
  delete3,
  findAll2,
  update2,
} from '@lib/api/generated/schedule/schedule';

vi.mock('@lib/api/generated/schedule/schedule', () => ({
  findAll2: vi.fn(),
  create2: vi.fn(),
  update2: vi.fn(),
  delete3: vi.fn(),
  changeAttendance: vi.fn(),
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
  it('등록 요청을 보내고 응답을 FE 타입으로 변환한다', async () => {
    const body = {
      staffId: 7,
      workDate: '2026-10-14',
      startTime: '09:00',
      endTime: '13:00',
      memo: '',
    };
    vi.mocked(create2).mockResolvedValue(createItem(10));

    await expect(createSchedule(body)).resolves.toMatchObject({
      id: 10,
      date: body.workDate,
      memo: '',
    });
    expect(create2).toHaveBeenCalledWith(body);
  });

  it('수정 요청은 생략한 필드를 추가하지 않고 빈 메모를 그대로 보낸다', async () => {
    vi.mocked(update2).mockResolvedValue(createItem(10, ''));

    await expect(updateSchedule(10, { memo: '' })).resolves.toMatchObject({
      id: 10,
      memo: '',
    });
    expect(update2).toHaveBeenCalledWith(10, { memo: '' });
  });

  it('삭제 응답의 ID를 검증한다', async () => {
    vi.mocked(delete3).mockResolvedValue({ id: 10 });
    await expect(deleteSchedule(10)).resolves.toBe(10);
    expect(delete3).toHaveBeenCalledWith(10);
  });

  it.each(['ATTENDED', 'ABSENT'] as const)(
    '출근 응답 %s를 boolean으로 변환한다',
    async (status) => {
      vi.mocked(changeAttendance).mockResolvedValue({
        scheduleId: 10,
        attendanceStatus: status,
      });
      await expect(changeScheduleAttendance(10, { status })).resolves.toEqual({
        id: 10,
        isCheckedIn: status === 'ATTENDED',
      });
      expect(changeAttendance).toHaveBeenCalledWith(10, { status });
    },
  );

  it('쓰기 응답이 잘못되면 검증에서 막는다', async () => {
    vi.mocked(create2).mockResolvedValue({
      ...createItem(10),
      workDate: '잘못된 날짜',
    });
    vi.mocked(update2).mockResolvedValue({
      ...createItem(10),
      staff: null,
    } as never);
    vi.mocked(delete3).mockResolvedValue({ id: '10' } as never);
    vi.mocked(changeAttendance).mockResolvedValue({
      scheduleId: 10,
      attendanceStatus: 'UNKNOWN',
    } as never);

    await expect(
      createSchedule({
        staffId: 7,
        workDate: '2026-10-14',
        startTime: '09:00',
        endTime: '13:00',
      }),
    ).rejects.toBeInstanceOf(ZodError);
    await expect(updateSchedule(10, { memo: '' })).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(deleteSchedule(10)).rejects.toBeInstanceOf(ZodError);
    await expect(
      changeScheduleAttendance(10, { status: 'ATTENDED' }),
    ).rejects.toBeInstanceOf(ZodError);
  });

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
