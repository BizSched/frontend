import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PartTimeScheduleDaySummary } from '@components/partTime/schedule/PartTimeScheduleDaySummary';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

import { mockResizeObserver } from '@test/helpers/mockResizeObserver';

const schedule: PartTimeSchedule = {
  id: 10,
  staff: { id: 7, name: '김알바', isDeleted: false },
  date: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: false,
  memo: '',
};

const longMemo = '마감 후 재고 확인'.repeat(30);

const renderDaySummary = (
  schedules: PartTimeSchedule[],
  onAttendanceChange = vi.fn(),
) =>
  render(
    <PartTimeScheduleDaySummary
      date={schedule.date}
      today="2026-10-14"
      schedules={schedules}
      onScheduleEdit={vi.fn()}
      onScheduleDelete={vi.fn()}
      onAttendanceChange={onAttendanceChange}
      isPending={false}
    />,
  );

const mockMemoOverflow = (isOverflowing: boolean) => {
  vi.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(
    isOverflowing ? 48 : 32,
  );
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(32);
};

beforeEach(() => mockResizeObserver({ width: 300, height: 32 }));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PartTimeScheduleDaySummary', () => {
  it.each([false, true])(
    '출근 체크 %s의 반대 상태를 전달한다',
    (isCheckedIn) => {
      const onAttendanceChange = vi.fn();
      const item = { ...schedule, isCheckedIn };
      render(
        <PartTimeScheduleDaySummary
          date={item.date}
          today="2026-10-14"
          schedules={[item]}
          onScheduleEdit={vi.fn()}
          onScheduleDelete={vi.fn()}
          onAttendanceChange={onAttendanceChange}
          isPending={false}
        />,
      );

      fireEvent.click(screen.getByRole('checkbox'));

      expect(onAttendanceChange).toHaveBeenCalledWith(item, !isCheckedIn);
    },
  );

  it.each([
    { today: '2026-10-13', isPending: false },
    { today: '2026-10-14', isPending: true },
  ])(
    '미래 근무 또는 요청 중에는 출근 변경을 막는다',
    ({ today, isPending }) => {
      const onAttendanceChange = vi.fn();
      render(
        <PartTimeScheduleDaySummary
          date={schedule.date}
          today={today}
          schedules={[schedule]}
          onScheduleEdit={vi.fn()}
          onScheduleDelete={vi.fn()}
          onAttendanceChange={onAttendanceChange}
          isPending={isPending}
        />,
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.getAttribute('aria-disabled')).toBe('true');
      fireEvent.click(checkbox);
      expect(onAttendanceChange).not.toHaveBeenCalled();
    },
  );

  it.each(['', '   '])('빈 메모 %j는 표시하지 않는다', (memo) => {
    renderDaySummary([{ ...schedule, memo }]);

    expect(screen.getByRole('listitem').querySelector('p')).toBeNull();
  });

  it('메모를 눌러도 출근 상태를 바꾸지 않는다', () => {
    const onAttendanceChange = vi.fn();
    renderDaySummary(
      [{ ...schedule, memo: '오픈 준비 담당' }],
      onAttendanceChange,
    );

    fireEvent.click(screen.getByText('오픈 준비 담당'));

    expect(onAttendanceChange).not.toHaveBeenCalled();
  });

  it('두 줄을 넘지 않는 메모는 펼치기 버튼을 두지 않는다', () => {
    mockMemoOverflow(false);
    renderDaySummary([{ ...schedule, memo: '오픈 준비 담당' }]);

    expect(screen.queryByRole('button', { name: '메모 펼치기' })).toBeNull();
  });

  it('두 줄을 넘는 메모는 펼치고 접어도 출근 상태를 바꾸지 않는다', () => {
    const onAttendanceChange = vi.fn();
    mockMemoOverflow(true);
    renderDaySummary([{ ...schedule, memo: longMemo }], onAttendanceChange);

    const memo = screen.getByText(longMemo);
    expect(memo.className).toContain('line-clamp-2');

    fireEvent.click(screen.getByRole('button', { name: '메모 펼치기' }));

    const collapseButton = screen.getByRole('button', { name: '메모 접기' });
    expect(collapseButton.getAttribute('aria-expanded')).toBe('true');
    expect(collapseButton.getAttribute('aria-controls')).toBe(memo.id);
    expect(memo.className).not.toContain('line-clamp-2');

    fireEvent.click(collapseButton);

    expect(memo.className).toContain('line-clamp-2');
    expect(onAttendanceChange).not.toHaveBeenCalled();
  });
});
