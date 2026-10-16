import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PartTimeStaffCard } from '@components/partTime/staff/PartTimeStaffCard';

vi.mock('@assets/icons/ic_note.svg', () => ({ default: '/note.svg' }));

afterEach(cleanup);

describe('PartTimeStaffCard', () => {
  it('삭제 중에는 더보기 메뉴를 열 수 없고 상세 열기는 유지한다', () => {
    const onDetailOpen = vi.fn();
    render(
      <PartTimeStaffCard
        staff={{
          id: 42,
          name: '김알바',
          phone: null,
          createdAt: '2026-10-14T09:00:00+09:00',
        }}
        isDeletePending
        onDetailOpen={onDetailOpen}
      />,
    );

    const trigger = screen.getByRole('button', { name: '김알바 더보기' });
    expect(trigger.hasAttribute('disabled')).toBe(true);
    fireEvent.click(trigger);
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '김알바 상세 보기' }));
    expect(onDetailOpen).toHaveBeenCalledTimes(1);
  });
});
