import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

import { salesCategoryKeys } from '@hooks/api/sales-category/salesCategoryQueryOptions';

import { OverlayProvider } from '@providers/overlay/OverlayProvider';

import { createSale } from '@lib/api/entities/sales/api';
import { CALENDAR_TIME_ZONE } from '@lib/utilities/calendar/calendarDate';

vi.mock('@lib/api/entities/sales/api', () => ({ createSale: vi.fn() }));

const categories = ['상품 판매', '서비스', '배달·온라인', '기타'].map(
  (name, index) => ({ id: index + 1, name }),
);

const originalMatchMedia = window.matchMedia;

const mockMatchMedia = () => {
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

const renderSalesEntryModal = (close = vi.fn()) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(salesCategoryKeys.list(), categories);
  render(
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <SalesEntryModal
          overlayId="test"
          isOpen={true}
          close={close}
          unmount={() => {}}
          returnFocus={document.body}
        />
      </OverlayProvider>
    </QueryClientProvider>,
  );
  return close;
};

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
  vi.useRealTimers();
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
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-13T18:00:00Z'));
    mockMatchMedia();
    renderSalesEntryModal();
    const tomorrow = addDays(new Date(), 1);
    const tomorrowLabel = new Intl.DateTimeFormat('ko-KR', {
      dateStyle: 'full',
      timeZone: CALENDAR_TIME_ZONE,
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

  it('저장하면 카테고리 ID별 금액과 합계로 생성하고 모달을 닫는다.', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-13T03:00:00Z'));
    vi.mocked(createSale).mockResolvedValue({} as never);
    mockMatchMedia();
    const close = renderSalesEntryModal();
    fireEvent.change(screen.getByLabelText('상품 판매'), {
      target: { value: '1,000' },
    });
    fireEvent.change(screen.getByLabelText('기타'), {
      target: { value: '500' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(createSale).toHaveBeenCalledWith({
      date: '2026-10-13',
      sales: [
        { categoryId: 1, amount: 1000 },
        { categoryId: 2, amount: 0 },
        { categoryId: 3, amount: 0 },
        { categoryId: 4, amount: 500 },
      ],
      totalAmount: 1500,
    });
  });

  it('생성에 실패하면 입력을 유지하고 오류를 표시한다.', async () => {
    vi.mocked(createSale).mockRejectedValue(new Error('save failed'));
    mockMatchMedia();
    const close = renderSalesEntryModal();
    fireEvent.change(screen.getByLabelText('상품 판매'), {
      target: { value: '1000' },
    });
    fireEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '매출 내역을 불러오지 못했습니다.',
    );
    expect(screen.getByLabelText('상품 판매')).toHaveValue('1000');
    expect(close).not.toHaveBeenCalled();
  });
});
