import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SalesCategoryCard } from '@components/sales/SalesCategoryCard';
import { SalesRecordsCard } from '@components/sales/SalesRecordsCard';
import { SalesSummaryCards } from '@components/sales/SalesSummaryCards';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';
import { salesCategoryKeys } from '@hooks/api/sales-category/salesCategoryQueryOptions';

import type { SalesList } from '@lib/api/entities/sales/toSalesList';
import type { SalesRatio } from '@lib/api/entities/sales/toSalesRatio';
import type { SalesSummary } from '@lib/api/entities/sales/toSalesSummary';
import type { SalesCategory } from '@lib/api/entities/sales-category/toSalesCategory';

const MONTH = '2026-10';

const SUMMARY: SalesSummary = {
  month: MONTH,
  startDate: '2026-10-01',
  endDate: '2026-10-13',
  totalAmount: 1200000,
  previousMonth: { totalAmount: 1000000, changeRate: 20 },
  previousYear: { totalAmount: 1350000, changeAmount: -150000 },
};

const CATEGORIES: SalesCategory[] = [
  { id: 3, name: '음료', color: '#F26B1D', order: 1 },
  { id: 1, name: '디저트', color: '#F2A71D', order: 2 },
];

const RATIO: SalesRatio = {
  month: MONTH,
  totalAmount: 1200000,
  items: [
    {
      categoryId: 3,
      name: '음료',
      color: '#F26B1D',
      amount: 1200000,
      percent: 100,
    },
    {
      categoryId: 1,
      name: '디저트',
      color: '#F2A71D',
      amount: 0,
      percent: 0,
    },
  ],
};

const SALES_LIST: SalesList = {
  page: 1,
  size: 8,
  totalCount: 1,
  totalPage: 1,
  items: [
    {
      id: 42,
      date: '2026-10-13',
      sales: [
        { categoryId: 1, name: '디저트', amount: 50000 },
        { categoryId: 3, name: '음료', amount: 1150000 },
      ],
      totalAmount: 1200000,
    },
  ],
};

const EMPTY_LIST: SalesList = {
  page: 1,
  size: 8,
  totalCount: 0,
  totalPage: 0,
  items: [],
};

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

const renderWith = (queryClient: QueryClient, ui: React.ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

afterEach(cleanup);

describe('SalesSummaryCards', () => {
  it('changeRate가 null이면 전월 대비에 -와 비교할 데이터 없음을 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(salesKeys.summary({ month: MONTH }), {
      ...SUMMARY,
      previousMonth: { totalAmount: 0, changeRate: null },
    });

    renderWith(queryClient, <SalesSummaryCards month={MONTH} />);

    const card = screen.getByRole('heading', { name: '전월 대비 증감' })
      .parentElement as HTMLElement;
    expect(within(card).getByText('-')).toBeInTheDocument();
    expect(within(card).getByText('비교할 데이터 없음')).toBeInTheDocument();
  });

  it('전년 증감액이 음수면 -150,000 원으로 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(salesKeys.summary({ month: MONTH }), SUMMARY);

    renderWith(queryClient, <SalesSummaryCards month={MONTH} />);

    expect(screen.getByText('-150,000 원')).toBeInTheDocument();
  });

  it('refetch가 실패해도 이미 받은 금액을 계속 표시한다', () => {
    const queryClient = createQueryClient();
    const queryKey = salesKeys.summary({ month: MONTH });
    queryClient.setQueryData(queryKey, SUMMARY);
    queryClient
      .getQueryCache()
      .find({ queryKey })
      ?.setState({
        status: 'error',
        error: new Error('network down'),
        fetchStatus: 'idle',
      });

    renderWith(queryClient, <SalesSummaryCards month={MONTH} />);

    expect(screen.getByText('1,200,000 원')).toBeInTheDocument();
  });
});

describe('SalesCategoryCard', () => {
  it('카테고리 총액이 0이면 도넛 대신 아직 입력된 매출이 없습니다를 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(salesKeys.ratio({ month: MONTH }), {
      ...RATIO,
      totalAmount: 0,
      items: RATIO.items.map((item) => ({ ...item, amount: 0, percent: 0 })),
    });

    renderWith(queryClient, <SalesCategoryCard month={MONTH} />);

    expect(screen.getByText('아직 입력된 매출이 없습니다')).toBeInTheDocument();
  });
});

describe('SalesRecordsCard', () => {
  it('최근 내역이 없으면 등록된 매출 내역이 없습니다를 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(salesKeys.list({ page: 1, size: 8 }), EMPTY_LIST);
    queryClient.setQueryData(salesCategoryKeys.list(), CATEGORIES);

    renderWith(queryClient, <SalesRecordsCard />);

    expect(screen.getByText('등록된 매출 내역이 없습니다')).toBeInTheDocument();
  });

  it('최근 내역 표 헤더를 카테고리 응답 순서로 그린다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(salesKeys.list({ page: 1, size: 8 }), SALES_LIST);
    queryClient.setQueryData(salesCategoryKeys.list(), CATEGORIES);

    renderWith(queryClient, <SalesRecordsCard />);

    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent);
    expect(headers.slice(1, 3)).toEqual(['음료', '디저트']);
  });
});
