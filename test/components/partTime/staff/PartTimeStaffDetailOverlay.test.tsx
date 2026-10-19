import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { overlay, OverlayProvider } from 'overlay-kit';
import { StrictMode, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { PartTimeStaffDetailOverlay } from '@components/partTime/staff/PartTimeStaffDetailOverlay';

import type { PartTimeStaffDetailItem } from '@lib/types/partTimeStaff';

vi.mock('next/image', () => ({ default: () => null }));
vi.mock('@components/partTime/staff/PartTimeStaffAttachmentViewer', () => ({
  PartTimeStaffAttachmentViewer: () => (
    <section aria-label="첨부파일 미리보기" />
  ),
}));

const STAFF: PartTimeStaffDetailItem = {
  id: 42,
  name: '김알바',
  createdAt: '2026-10-15T09:00:00+09:00',
  employmentStatus: 'employed',
  attachments: [
    {
      id: 3,
      name: '계약서.pdf',
      type: 'pdf',
      url: '/api/staff/42/attachments/3',
    },
  ],
};

function DetailHarness() {
  const [open, setOpen] = useState(false);
  const [staff, setStaff] = useState(STAFF);
  const [pending, setPending] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>상세 열기</button>
      <button onClick={() => setStaff({ ...staff, id: 99, name: '다른 직원' })}>
        다른 직원 보기
      </button>
      <button onClick={() => setOpen(false)}>URL로 닫기</button>
      <PartTimeStaffDetailOverlay
        open={open}
        onOpenChange={setOpen}
        staff={staff}
        weeklyShifts={[]}
        now="2026-10-15T12:00"
        isEmploymentStatusLocked={pending}
        onEmploymentStatusChange={async (_id, employmentStatus) => {
          setPending(true);
          try {
            const confirmed = await openConfirmModal({
              title: '재직 상태를 바꾸시겠어요?',
              confirmText: '변경',
            });
            if (confirmed) setStaff({ ...staff, employmentStatus });
          } finally {
            setPending(false);
          }
        }}
      />
    </>
  );
}

const renderDetail = () =>
  render(
    <StrictMode>
      <OverlayProvider>
        <DetailHarness />
      </OverlayProvider>
    </StrictMode>,
  );

const openConfirmation = async () => {
  const group = screen.getByRole('group', { name: '재직 상태' });
  fireEvent.click(within(group).getByRole('button'));
  fireEvent.click(await screen.findByRole('menuitem', { name: '휴직' }));
  return screen.findByRole('dialog', { name: '재직 상태를 바꾸시겠어요?' });
};

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  act(() => overlay.unmountAll());
  cleanup();
  vi.unstubAllGlobals();
});

describe('PartTimeStaffDetailOverlay', () => {
  it('상세와 확인창의 스택을 분리하고 상세·뷰어 영역에만 추가 딤을 둔다', async () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
    const detail = await screen.findByRole('dialog', { name: STAFF.name });
    fireEvent.click(screen.getByRole('button', { name: '계약서.pdf 열기' }));
    expect(
      screen.getByRole('region', { name: '첨부파일 미리보기' }),
    ).toBeTruthy();

    const confirm = await openConfirmation();
    expect(
      detail.parentElement?.style.getPropertyValue('--modal-stack-index'),
    ).toBe('0');
    expect(
      confirm.parentElement?.style.getPropertyValue('--modal-stack-index'),
    ).toBe('1');
    expect(confirm.previousElementSibling?.className).not.toContain(
      'bg-overlay',
    );
    expect(
      detail.querySelector('[aria-hidden="true"].bg-overlay'),
    ).toBeTruthy();

    fireEvent.click(within(confirm).getByRole('button', { name: '취소' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: '재직 상태를 바꾸시겠어요?' }),
      ).toBeNull(),
    );
    expect(
      await screen.findByRole('dialog', { name: STAFF.name }),
    ).toBeTruthy();
    await waitFor(() =>
      expect(
        detail.querySelector('[aria-hidden="true"].bg-overlay'),
      ).toBeNull(),
    );
    await waitFor(() =>
      expect(detail.contains(document.activeElement)).toBe(true),
    );
  });

  it('확인창의 Escape와 변경은 상세를 닫지 않고, 변경 결과를 열린 패널에 반영한다', async () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
    await screen.findByRole('dialog', { name: STAFF.name });
    let confirm = await openConfirmation();
    fireEvent.keyDown(confirm, { key: 'Escape', code: 'Escape' });
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: '재직 상태를 바꾸시겠어요?' }),
      ).toBeNull(),
    );
    expect(screen.getByRole('dialog', { name: STAFF.name })).toBeTruthy();
    await waitFor(() =>
      expect(
        screen
          .getByRole('dialog', { name: STAFF.name })
          .contains(document.activeElement),
      ).toBe(true),
    );

    confirm = await openConfirmation();
    fireEvent.click(within(confirm).getByRole('button', { name: '변경' }));
    await waitFor(() =>
      expect(
        within(screen.getByRole('group', { name: '재직 상태' })).getByRole(
          'button',
        ).textContent,
      ).toContain('휴직'),
    );
    expect(screen.getByRole('dialog', { name: STAFF.name })).toBeTruthy();
  });

  it('열린 동안 props 갱신과 URL 닫기를 반영하고 재진입 시 상세를 하나만 연다', async () => {
    renderDetail();
    fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
    await screen.findByRole('dialog', { name: STAFF.name });
    fireEvent.click(
      screen.getByRole('button', { name: '다른 직원 보기', hidden: true }),
    );
    await screen.findByRole('dialog', { name: '다른 직원' });
    fireEvent.click(
      screen.getByRole('button', { name: 'URL로 닫기', hidden: true }),
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
    await screen.findByRole('dialog', { name: '다른 직원' });
    expect(screen.getAllByRole('dialog')).toHaveLength(1);
  });

  it('상세 화면을 떠나면 오버레이를 해제해 다음 모달의 스택을 남기지 않는다', async () => {
    const { rerender } = renderDetail();
    fireEvent.click(screen.getByRole('button', { name: '상세 열기' }));
    await screen.findByRole('dialog', { name: STAFF.name });

    rerender(
      <StrictMode>
        <OverlayProvider>
          <button
            onClick={() => {
              void openConfirmModal({ title: '새 화면 확인' });
            }}
          >
            다음 모달 열기
          </button>
        </OverlayProvider>
      </StrictMode>,
    );
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: '다음 모달 열기' }));
    const confirm = await screen.findByRole('dialog', { name: '새 화면 확인' });
    expect(
      confirm.parentElement?.style.getPropertyValue('--modal-stack-index'),
    ).toBe('0');
  });
});
