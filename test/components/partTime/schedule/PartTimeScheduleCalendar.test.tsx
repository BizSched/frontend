import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PartTimeScheduleCalendar } from '@components/partTime/schedule/PartTimeScheduleCalendar';
import type { PartTimeScheduleStaffFilterProps } from '@components/partTime/schedule/PartTimeScheduleStaffFilter';

import { ApiError } from '@lib/api/apiError';
import { getScheduleList } from '@lib/api/entities/schedule/api';
import { getAllStaffs } from '@lib/api/entities/staff/api';

vi.mock('@lib/api/entities/schedule/api', () => ({ getScheduleList: vi.fn() }));
vi.mock('@lib/api/entities/staff/api', () => ({ getAllStaffs: vi.fn() }));
vi.mock('@components/_common/Calendar/Calendar', () => ({
  Calendar: ({ headerSlot }: { headerSlot: ReactNode }) => (
    <section aria-label="캘린더">{headerSlot}</section>
  ),
}));
vi.mock('@components/partTime/schedule/PartTimeScheduleDaySummary', () => ({
  PartTimeScheduleDaySummary: () => null,
}));
vi.mock('@components/partTime/schedule/PartTimeScheduleStaffFilter', () => ({
  PartTimeScheduleStaffFilter: ({
    isError,
    onRetry,
  }: PartTimeScheduleStaffFilterProps) =>
    isError ? <button onClick={onRetry}>필터 다시 불러오기</button> : null,
}));

const clients: QueryClient[] = [];
const renderCalendar = () => {
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeScheduleCalendar today="2026-10-15" initialMonth="2026-10" />
    </QueryClientProvider>,
  );
};

afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.resetAllMocks();
});

describe('PartTimeScheduleCalendar 조회 오류', () => {
  it('인라인 4xx는 캘린더를 유지한 채 한 줄 오류와 다시 시도를 보여준다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList)
      .mockRejectedValueOnce(
        new ApiError('BAD', 400, '요청 값이 올바르지 않아요.'),
      )
      .mockResolvedValue([]);
    renderCalendar();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('요청 값이 올바르지 않아요.');
    expect(screen.getByRole('region', { name: '캘린더' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(getScheduleList).toHaveBeenCalledTimes(2);
  });

  it('필터 아르바이트생 목록 실패는 필터 안에서 다시 불러온다', async () => {
    vi.mocked(getScheduleList).mockResolvedValue([]);
    vi.mocked(getAllStaffs)
      .mockRejectedValueOnce(new ApiError('BAD', 400))
      .mockResolvedValue([]);
    renderCalendar();

    fireEvent.click(
      await screen.findByRole('button', { name: '필터 다시 불러오기' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: '필터 다시 불러오기' }),
      ).toBeNull(),
    );
    expect(getAllStaffs).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
