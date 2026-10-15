import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PartTimeStaffWeeklySchedule } from '@components/partTime/staff/PartTimeStaffWeeklySchedule';

import { ApiError } from '@lib/api/apiError';

vi.mock('@assets/icons/ic_checkbox.svg', () => ({ default: '/checkbox.svg' }));

const NOW = '2026-10-15T12:00';
const SHIFT = {
  id: 1,
  date: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: true,
};

afterEach(cleanup);

describe('PartTimeStaffWeeklySchedule', () => {
  it('조회 중에는 요일 칸을 유지하고 근무 대신 자리 표시를 보여준다', () => {
    const { container } = render(
      <PartTimeStaffWeeklySchedule now={NOW} shifts={[]} isLoading />,
    );

    expect(container.querySelector('section[aria-busy="true"]')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
    expect(container.querySelectorAll('.bg-slate-100')).toHaveLength(7);
  });

  it('조회 실패는 요일 칸 대신 한 줄 오류와 다시 시도를 보여준다', () => {
    const onRetry = vi.fn();
    render(
      <PartTimeStaffWeeklySchedule
        now={NOW}
        shifts={[]}
        error={new ApiError('BAD', 400, '잘못된 요청이에요.')}
        onRetry={onRetry}
      />,
    );

    expect(screen.getByRole('alert').textContent).toContain(
      '잘못된 요청이에요.',
    );
    expect(screen.queryByRole('list')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('조회가 끝나면 근무를 그린다', () => {
    render(<PartTimeStaffWeeklySchedule now={NOW} shifts={[SHIFT]} />);

    expect(screen.getByText('09:00~13:00')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
