import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PartTimeScheduleDaySummary } from '@components/partTime/schedule/PartTimeScheduleDaySummary';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

const schedule: PartTimeSchedule = {
  id: 10,
  staff: { id: 7, name: '김알바', isDeleted: false },
  date: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: false,
  memo: '',
};

afterEach(() => cleanup());

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
});
