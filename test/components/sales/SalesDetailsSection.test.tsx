import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';
import { salesCategoryKeys } from '@hooks/api/sales-category/salesCategoryQueryOptions';

import {
  deleteSale,
  getSalesList,
  getSalesMonthTotal,
  updateSale,
} from '@lib/api/entities/sales/api';
import type { SalesList } from '@lib/api/entities/sales/toSalesList';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/sales/details',
  useSearchParams: () => new URLSearchParams('month=2026-09'),
}));

vi.mock('@lib/api/entities/sales/api', () => ({
  getSalesList: vi.fn(),
  getSalesMonthTotal: vi.fn(),
  updateSale: vi.fn(),
  deleteSale: vi.fn(),
}));

vi.mock('@components/_common/Modal/openConfirmModal', () => ({
  openConfirmModal: vi.fn(),
}));

const categories = ['상품 판매', '서비스', '배달·온라인', '기타'].map(
  (name, index) => ({ id: index + 1, name }),
);
let salesList: SalesList;

const renderSalesDetailsSection = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  queryClient.setQueryData(
    salesKeys.list({ month: '2026-09', page: 1, size: 10 }),
    salesList,
  );
  queryClient.setQueryData(salesKeys.monthTotal({ month: '2026-09' }), 1000000);
  queryClient.setQueryData(salesCategoryKeys.list(), categories);
  return render(
    <QueryClientProvider client={queryClient}>
      <SalesDetailsSection initialMonth="2026-09" />
    </QueryClientProvider>,
  );
};

const getSeptemberThirtiethRow = () =>
  screen.getByRole('row', { name: /9월 30일/ });

beforeEach(() => {
  vi.resetAllMocks();
  salesList = {
    page: 1,
    size: 10,
    totalCount: 2,
    totalPage: 1,
    items: [
      {
        id: 42,
        date: '2026-09-30',
        sales: categories.map((category, index) => ({
          categoryId: category.id,
          name: category.name,
          amount: [183400, 148700, 351900, 72300][index],
        })),
        totalAmount: 756300,
      },
      {
        id: 43,
        date: '2026-09-29',
        sales: categories.map((category, index) => ({
          categoryId: category.id,
          name: category.name,
          amount: [372000, 191500, 142900, 75600][index],
        })),
        totalAmount: 782000,
      },
    ],
  };
  vi.mocked(getSalesList).mockImplementation(async () => salesList);
  vi.mocked(getSalesMonthTotal).mockResolvedValue(1000000);
  vi.mocked(updateSale).mockImplementation(async (salesId, body) => {
    const sale = salesList.items.find((item) => item.id === salesId)!;
    const updated = {
      ...sale,
      sales: body.sales.map((item) => ({
        ...item,
        amount: item.amount ?? 0,
        name:
          categories.find((category) => category.id === item.categoryId)
            ?.name ?? '',
      })),
      totalAmount: body.totalAmount,
    };
    salesList = {
      ...salesList,
      items: salesList.items.map((item) =>
        item.id === salesId ? updated : item,
      ),
    };
    return updated;
  });
  vi.mocked(deleteSale).mockImplementation(async (salesId) => {
    salesList = {
      ...salesList,
      items: salesList.items.filter((item) => item.id !== salesId),
    };
  });
  vi.mocked(openConfirmModal).mockReset();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('SalesDetailsSection', () => {
  it('수정 실패 시 입력 초안과 오류를 유지한다', async () => {
    vi.mocked(updateSale).mockRejectedValue(new Error('save failed'));
    renderSalesDetailsSection();
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 매출 수정' }));
    const input = screen.getByRole('spinbutton', {
      name: '상품 판매 9월 30일 매출',
    });
    fireEvent.change(input, { target: { value: '999999' } });
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 편집 저장' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      '매출 내역을 불러오지 못했습니다.',
    );
    expect(input).toHaveValue(999999);
  });

  it('전체 교체 시 현재 목록에서 빠진 카테고리의 기존 금액도 유지한다', async () => {
    salesList.items[0].sales.push({
      categoryId: 99,
      name: '이전 카테고리',
      amount: 100,
    });
    renderSalesDetailsSection();
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 매출 수정' }));
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 편집 저장' }));
    await waitFor(() =>
      expect(updateSale).toHaveBeenCalledWith(
        42,
        expect.objectContaining({
          sales: expect.arrayContaining([{ categoryId: 99, amount: 100 }]),
          totalAmount: 756400,
        }),
      ),
    );
  });

  it('삭제 실패 시 행을 유지하고 오류를 표시한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteSale).mockRejectedValue(new Error('delete failed'));
    renderSalesDetailsSection();
    fireEvent.click(screen.getByRole('button', { name: '9월 30일 매출 삭제' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(getSeptemberThirtiethRow()).toBeInTheDocument();
  });

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

  it('편집을 저장하면 수정한 금액을 표시한다', async () => {
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

    await waitFor(() =>
      expect(updateSale).toHaveBeenCalledWith(42, {
        sales: [
          { categoryId: 1, amount: 999999 },
          { categoryId: 2, amount: 148700 },
          { categoryId: 3, amount: 351900 },
          { categoryId: 4, amount: 72300 },
        ],
        totalAmount: 1572899,
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(getSeptemberThirtiethRow()).toHaveTextContent('999,999'),
    );
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
    expect(deleteSale).not.toHaveBeenCalled();
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
    expect(deleteSale).toHaveBeenCalledWith(42);
  });
});
