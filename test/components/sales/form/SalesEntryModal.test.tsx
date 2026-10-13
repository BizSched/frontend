import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
  waitFor,
} from '@testing-library/react';
import { addDays } from 'date-fns';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SalesEntryModal } from '@components/sales/form/SalesEntryModal/SalesEntryModal';

import { OverlayProvider } from '@providers/overlay/OverlayProvider';

const originalMatchMedia = window.matchMedia;

const mockMatchMedia = () => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

const renderSalesEntryModal = () =>
  render(
    <OverlayProvider>
      <SalesEntryModal
        overlayId="test"
        isOpen={true}
        close={() => {}}
        unmount={() => {}}
        returnFocus={document.body}
      />
    </OverlayProvider>,
  );

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('sales entry modal', () => {
  it('renders the modal', () => {
    mockMatchMedia();
    renderSalesEntryModal();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('금액을 입력하지 않으면 합계가 0원으로 표시된다.', () => {
    mockMatchMedia();
    renderSalesEntryModal();
    expect(
      within(screen.getByRole('dialog')).getByRole('status'),
    ).toHaveTextContent('0 원');
  });

  it('금액 0은 유효하고 합계 0원으로 표시된다.', () => {
    mockMatchMedia();
    renderSalesEntryModal();
    fireEvent.change(screen.getByLabelText('상품 판매'), {
      target: { value: '0' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    expect(
      within(screen.getByRole('dialog')).getByRole('status'),
    ).toHaveTextContent('0 원');
    expect(screen.getByLabelText('상품 판매')).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it.each(['-1', '1.5'])('금액 %s는 오류로 표시된다.', async (amount) => {
    mockMatchMedia();
    renderSalesEntryModal();
    fireEvent.change(screen.getByLabelText('상품 판매'), {
      target: { value: amount },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));
    await waitFor(() =>
      expect(screen.getByLabelText('상품 판매')).toHaveAttribute(
        'aria-invalid',
        'true',
      ),
    );
  });

  it('미래 날짜는 오류로 표시된다.', async () => {
    mockMatchMedia();
    renderSalesEntryModal();
    const tomorrow = addDays(new Date(), 1);
    const tomorrowLabel = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'full',
    }).format(tomorrow);

    fireEvent.click(
      screen.getByRole('group', { name: '날짜' }).querySelector('button')!,
    );
    fireEvent.click(screen.getByRole('button', { name: tomorrowLabel }));
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '미래 날짜는 선택할 수 없습니다.',
    );
  });
});
