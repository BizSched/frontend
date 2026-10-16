import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PartTimeScheduleFormModal } from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

const SCHEDULE: PartTimeSchedule = {
  id: 10,
  staff: { id: 1, name: '김예림', isDeleted: false },
  date: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: false,
  memo: '',
};
const STAFFS = [SCHEDULE.staff, { id: 2, name: '강성구', isDeleted: false }];

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('PartTimeScheduleFormModal 수정 모드', () => {
  it('담당 아르바이트생을 다른 재직자로 바꿀 수 있다', async () => {
    render(
      <PartTimeScheduleFormModal
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        mode="edit"
        schedule={SCHEDULE}
        staffs={STAFFS}
      />,
    );

    const trigger = await screen.findByRole('button', { name: /김예림/ });
    expect(trigger.hasAttribute('disabled')).toBe(false);

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('menuitem', { name: '강성구' }));

    expect(await screen.findByRole('button', { name: /강성구/ })).toBeTruthy();
  });
});
