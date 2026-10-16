import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useScheduleList } from '@hooks/api/schedule/useScheduleList';
import { useStaffWeeklyShifts } from '@hooks/api/staff/useStaffWeeklyShifts';

import { getScheduleList } from '@lib/api/entities/schedule/api';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(),
}));

const createSchedule = (id: number, isDeleted = false): PartTimeSchedule => ({
  id,
  staff: { id: id * 10, name: `알바${id}`, isDeleted },
  date: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: true,
  memo: '오픈',
});

const clients: QueryClient[] = [];
const createWrapper = () => {
  const client = new QueryClient();
  clients.push(client);
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }
  return Wrapper;
};

afterEach(() => {
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.resetAllMocks();
});

describe('useScheduleList', () => {
  it('비활성 조회는 요청하지 않고 활성화한 시점에 조회한다', async () => {
    vi.mocked(getScheduleList).mockResolvedValue([createSchedule(1)]);
    const { result, rerender } = renderHook(
      ({ isEnabled }) =>
        useScheduleList({ from: '2026-09-28', to: '2026-11-01' }, isEnabled),
      { initialProps: { isEnabled: false }, wrapper: createWrapper() },
    );
    expect(getScheduleList).not.toHaveBeenCalled();
    rerender({ isEnabled: true });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(getScheduleList).toHaveBeenCalledTimes(1);
  });

  it('삭제한 아르바이트생의 스케쥴을 캘린더에서 뺀다', async () => {
    vi.mocked(getScheduleList).mockResolvedValue([
      createSchedule(1),
      createSchedule(2, true),
    ]);

    const { result } = renderHook(
      () => useScheduleList({ from: '2026-09-28', to: '2026-11-01' }),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.data?.map(({ id }) => id)).toEqual([1]),
    );
  });
});

describe('useStaffWeeklyShifts', () => {
  it('이번 주 월~일 범위와 staffId로 조회해 근무 타입으로 바꾼다', async () => {
    vi.mocked(getScheduleList).mockResolvedValue([createSchedule(1)]);

    const { result } = renderHook(
      () => useStaffWeeklyShifts(42, '2026-10-15T12:00'),
      { wrapper: createWrapper() },
    );

    await waitFor(() =>
      expect(result.current.data).toEqual([
        {
          id: 1,
          date: '2026-10-14',
          startTime: '09:00',
          endTime: '13:00',
          isCheckedIn: true,
        },
      ]),
    );
    expect(getScheduleList).toHaveBeenCalledWith(
      { from: '2026-10-12', to: '2026-10-18', staffId: 42 },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('상세를 열지 않았으면 조회하지 않는다', () => {
    renderHook(() => useStaffWeeklyShifts(0, '2026-10-15T12:00'), {
      wrapper: createWrapper(),
    });

    expect(getScheduleList).not.toHaveBeenCalled();
  });
});
