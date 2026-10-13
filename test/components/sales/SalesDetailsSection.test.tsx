import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { SalesDetailsSection } from '@components/sales/SalesDetailsSection/SalesDetailsSection';

vi.mock('@components/_common/Modal/openConfirmModal', () => ({
  openConfirmModal: vi.fn(),
}));

const renderSalesDetailsSection = () => render(<SalesDetailsSection />);

const getSeptemberThirtiethRow = () =>
  screen.getByRole('row', { name: /9월 30일/ });

beforeEach(() => {
  vi.mocked(openConfirmModal).mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SalesDetailsSection', () => {
  it.each(['-1', '1.5'])(
    '금액 %s는 저장하지 않고 편집 초안을 유지한다',
    (amount) => {
      renderSalesDetailsSection();
      fireEvent.click(
        screen.getByRole('button', { name: '9월 30일 매출 수정' }),
      );
      const input = screen.getByRole('spinbutton', {
        name: '상품 판매 9월 30일 매출',
      });
      fireEvent.change(input, { target: { value: amount } });
      fireEvent.click(
        screen.getByRole('button', { name: '9월 30일 편집 저장' }),
      );

      expect(input).toBeInTheDocument();
      expect(input).toHaveValue(Number(amount));
      expect(screen.getByRole('alert')).toHaveTextContent(
        '0 이상의 정수로 입력해 주세요.',
      );
      fireEvent.click(
        screen.getByRole('button', { name: '9월 30일 편집 취소' }),
      );
      expect(getSeptemberThirtiethRow()).toHaveTextContent('183,400');
    },
  );

  it('편집 중에는 모바일에서도 카테고리 헤더와 모든 행의 열을 함께 표시한다', () => {
    renderSalesDetailsSection();
    const header = screen.getByRole('columnheader', { name: '상품 판매' });
    expect(header).toHaveClass('max-tablet:hidden');
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 매출 수정' }));
    expect(header).not.toHaveClass('max-tablet:hidden');
    const otherRow = screen.getByRole('row', { name: /9월 29일/ });
    expect(
      within(otherRow).getByRole('cell', { name: '372,000' }),
    ).not.toHaveClass('max-tablet:hidden');
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 편집 취소' }));
    expect(header).toHaveClass('max-tablet:hidden');
  });

  it('편집을 취소하면 원래 금액을 유지한다', () => {
    renderSalesDetailsSection();
    fireEvent.click(
      within(getSeptemberThirtiethRow()).getByRole('button', {
        name: '9월 30일 매출 수정',
      }),
    );
    fireEvent.change(
      screen.getByRole('spinbutton', { name: '상품 판매 9월 30일 매출' }),
      {
        target: { value: '999999' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 편집 취소' }));

    expect(getSeptemberThirtiethRow()).toHaveTextContent('183,400');
    expect(
      screen.queryByRole('spinbutton', { name: '상품 판매 9월 30일 매출' }),
    ).not.toBeInTheDocument();
  });

  it('한 날짜를 편집하는 동안 다른 날짜 편집은 막는다', () => {
    renderSalesDetailsSection();
    fireEvent.click(
      within(getSeptemberThirtiethRow()).getByRole('button', {
        name: '9월 30일 매출 수정',
      }),
    );

    expect(
      within(screen.getByRole('row', { name: /9월 29일/ })).getByRole(
        'button',
        { name: '9월 29일 매출 수정' },
      ),
    ).toBeDisabled();
  });

  it('편집을 저장하면 수정한 금액을 표시한다', () => {
    renderSalesDetailsSection();
    fireEvent.click(
      within(getSeptemberThirtiethRow()).getByRole('button', {
        name: '9월 30일 매출 수정',
      }),
    );
    fireEvent.change(
      screen.getByRole('spinbutton', { name: '상품 판매 9월 30일 매출' }),
      {
        target: { value: '999999' },
      },
    );
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 편집 저장' }));

    expect(getSeptemberThirtiethRow()).toHaveTextContent('999,999');
  });

  it('삭제 확인을 취소하면 해당 날짜 행을 유지한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    renderSalesDetailsSection();

    fireEvent.click(
      within(getSeptemberThirtiethRow()).getByRole('button', {
        name: '9월 30일 매출 삭제',
      }),
    );

    expect(
      await screen.findByRole('row', { name: /9월 30일/ }),
    ).toBeInTheDocument();
    expect(openConfirmModal).toHaveBeenCalledTimes(1);
  });

  it('삭제를 확인하면 해당 날짜 행을 제거한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    renderSalesDetailsSection();

    fireEvent.click(
      within(getSeptemberThirtiethRow()).getByRole('button', {
        name: '9월 30일 매출 삭제',
      }),
    );

    expect(openConfirmModal).toHaveBeenCalledWith({
      title: '해당 날짜의 매출 전체를 삭제할까요?',
      description: '삭제한 내역은 복구할 수 없습니다.',
      confirmText: '삭제',
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('row', { name: /9월 30일/ }),
      ).not.toBeInTheDocument(),
    );
    expect(openConfirmModal).toHaveBeenCalledTimes(1);
  });
});
