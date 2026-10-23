import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PartTimeStaffDetailPanel } from '@components/partTime/staff/PartTimeStaffDetailPanel';

import { ApiError } from '@lib/api/apiError';
import type { PartTimeStaffDetailItem } from '@lib/types/partTimeStaff';

const transition = vi.hoisted(() => ({ complete: (_isOpen: boolean) => {} }));
vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({
      children,
      onOpenChangeComplete,
    }: {
      children: ReactNode;
      onOpenChangeComplete: (open: boolean) => void;
    }) => {
      transition.complete = onOpenChangeComplete;
      return children;
    },
    Portal: ({ children }: { children: ReactNode }) => children,
    Backdrop: () => null,
    Popup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Close: ({ children }: { children: ReactNode }) => (
      <button aria-label="닫기">{children}</button>
    ),
  },
}));
vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@components/partTime/staff/PartTimeStaffAttachmentViewer', () => ({
  PartTimeStaffAttachmentViewer: () => (
    <section aria-label="첨부파일 미리보기" />
  ),
}));

afterEach(cleanup);
const STAFF: PartTimeStaffDetailItem = {
  id: 42,
  name: '김알바',
  phone: '010-1234-5678',
  createdAt: '2026-10-15T09:00:00+09:00',
  employmentStatus: 'employed',
  birthDate: null,
  gender: null,
  hourlyWage: null,
  memo: '마지막으로 본 메모',
  attachments: [
    {
      id: 3,
      name: '계약서.pdf',
      type: 'pdf',
      url: '/api/staff/42/attachments/3',
    },
  ],
};
const BASE = {
  onOpenChange: vi.fn(),
  weeklyShifts: [],
  now: '2026-10-15T12:00',
};

describe('PartTimeStaffDetailPanel', () => {
  it('닫힘 애니메이션이 끝날 때까지 상세와 첨부파일 뷰어를 유지한다', () => {
    const { rerender } = render(
      <PartTimeStaffDetailPanel
        {...BASE}
        weeklyShifts={[
          {
            id: 1,
            date: '2026-10-15',
            startTime: '17:00',
            endTime: '22:00',
            isCheckedIn: false,
          },
        ]}
        open
        staff={STAFF}
      />,
    );
    const schedule = screen.getByRole('heading', { level: 3 }).parentElement
      ?.textContent;
    fireEvent.click(screen.getByRole('button', { name: '계약서.pdf 열기' }));
    rerender(<PartTimeStaffDetailPanel {...BASE} open={false} />);
    expect(screen.getByText(STAFF.name)).toBeTruthy();
    expect(screen.getByText(STAFF.memo!)).toBeTruthy();
    expect(
      screen.getByRole('heading', { level: 3 }).parentElement?.textContent,
    ).toBe(schedule);
    expect(
      screen.getByRole('region', { name: '첨부파일 미리보기' }),
    ).toBeTruthy();
    act(() => transition.complete(false));
    expect(screen.queryByText(STAFF.name)).toBeNull();
    expect(
      screen.queryByRole('region', { name: '첨부파일 미리보기' }),
    ).toBeNull();
  });

  it('닫히는 중 다른 직원을 열면 이전 상세를 보여주지 않는다', () => {
    const { rerender } = render(
      <PartTimeStaffDetailPanel {...BASE} open staff={STAFF} />,
    );
    rerender(<PartTimeStaffDetailPanel {...BASE} open={false} />);
    rerender(
      <PartTimeStaffDetailPanel
        {...BASE}
        open
        listStaff={{ ...STAFF, id: 99, name: '새 직원' }}
        isLoading
      />,
    );
    expect(screen.getByText('새 직원')).toBeTruthy();
    expect(screen.queryByText(STAFF.name)).toBeNull();
    expect(screen.queryByText(STAFF.memo!)).toBeNull();
  });

  it('로딩 안내는 한 번만 표시하고 상세 필드를 빈 값으로 표시하지 않는다', () => {
    render(
      <PartTimeStaffDetailPanel {...BASE} open listStaff={STAFF} isLoading />,
    );
    expect(screen.getAllByText(/불러오는 중/)).toHaveLength(1);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.queryByText('-')).toBeNull();
  });

  it('상세 조회 실패와 성공 응답의 빈 값을 구분한다', () => {
    const { rerender } = render(
      <PartTimeStaffDetailPanel
        {...BASE}
        open
        listStaff={STAFF}
        error={new ApiError('BAD_REQUEST', 400)}
      />,
    );
    expect(screen.getAllByText('조회 실패')).toHaveLength(3);
    expect(screen.queryByText('-')).toBeNull();
    expect(screen.getByRole('alert')).toBeTruthy();
    rerender(<PartTimeStaffDetailPanel {...BASE} open staff={STAFF} />);
    expect(screen.getAllByText('-')).toHaveLength(3);
    expect(screen.queryByText('조회 실패')).toBeNull();
  });

  it('이름 옆 드롭다운에서 다른 재직 상태를 고를 때만 변경을 요청한다', async () => {
    const onEmploymentStatusChange = vi.fn();
    render(
      <PartTimeStaffDetailPanel
        {...BASE}
        open
        staff={STAFF}
        onEmploymentStatusChange={onEmploymentStatusChange}
      />,
    );
    const group = screen.getByRole('group', { name: '재직 상태' });
    const trigger = within(group).getByRole('button');
    expect(trigger.textContent).toContain('재직');

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('menuitem', { name: '재직' }));
    expect(onEmploymentStatusChange).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    fireEvent.click(await screen.findByRole('menuitem', { name: '휴직' }));
    expect(onEmploymentStatusChange).toHaveBeenCalledWith(42, 'onLeave');
  });

  it('잠긴 동안 드롭다운을 막고 진행 문구를 헤더 아래에 표시한다', () => {
    const { rerender } = render(
      <PartTimeStaffDetailPanel
        {...BASE}
        open
        staff={STAFF}
        onEmploymentStatusChange={vi.fn()}
        isEmploymentStatusLocked
        isEmploymentStatusPending
      />,
    );
    const group = screen.getByRole('group', { name: '재직 상태' });
    expect(within(group).getByRole('button').hasAttribute('disabled')).toBe(
      true,
    );
    expect(screen.getByRole('status').textContent).toBe(
      '재직 상태를 바꾸는 중입니다.',
    );

    rerender(
      <PartTimeStaffDetailPanel
        {...BASE}
        open
        staff={STAFF}
        onEmploymentStatusChange={vi.fn()}
      />,
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(within(group).getByRole('button').hasAttribute('disabled')).toBe(
      false,
    );
  });

  it('변경 핸들러가 없으면 재직 상태 드롭다운을 그리지 않는다', () => {
    render(<PartTimeStaffDetailPanel {...BASE} open staff={STAFF} />);
    expect(screen.queryByRole('group', { name: '재직 상태' })).toBeNull();
  });
});
