import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { DashboardHeader } from '@components/dashboard/DashboardHeader';
import { SalesChartSection } from '@components/dashboard/SalesChartSection/SalesChartSection';
import { TodayWorkerSection } from '@components/dashboard/TodayWorkerSection/TodayWorkerSection';

import { salesKeys } from '@hooks/api/sales/salesQueryOptions';
import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import { userKeys } from '@hooks/api/users/userQueryOptions';

import { ApiError } from '@lib/api/apiError';
import type { SalesChart } from '@lib/api/entities/sales/toSalesChart';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

const TODAY = '2026-10-16';

const createSchedule = (
  id: number,
  name: string,
  startTime: string,
  endTime: string,
  isDeleted = false,
): PartTimeSchedule => ({
  id,
  staff: { id, name, isDeleted },
  date: TODAY,
  startTime,
  endTime,
  isCheckedIn: false,
  memo: '',
});

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: { queries: { retry: false, retryOnMount: false } },
  });

const renderWith = (queryClient: QueryClient, ui: React.ReactElement) =>
  render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);

const scheduleKey = scheduleKeys.list({ from: TODAY, to: TODAY });

afterEach(cleanup);

// NOTE: 데스크톱 4열과 모바일 행 레이아웃이 CSS로만 나뉘어 DOM에는 둘 다 있다
describe('TodayWorkerSection', () => {
  it('스케쥴을 시간대 칸에 이름·시간·근무 시간과 함께 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(scheduleKey, [
      createSchedule(1, '신짱구', '12:00', '18:00'),
    ]);

    renderWith(queryClient, <TodayWorkerSection today={TODAY} />);

    expect(screen.getAllByText('신짱구')).toHaveLength(2);
    expect(screen.getAllByText('12:00 - 18:00 (6시간)')).toHaveLength(2);
    expect(screen.getAllByText('근무자 없음')).toHaveLength(6);
  });

  it('오늘 근무자가 없으면 네 시간대 모두 근무자 없음을 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(scheduleKey, []);

    renderWith(queryClient, <TodayWorkerSection today={TODAY} />);

    expect(screen.getAllByText('근무자 없음')).toHaveLength(8);
  });

  it('삭제된 알바생의 스케쥴은 표시하지 않는다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(scheduleKey, [
      createSchedule(1, '퇴사자', '09:00', '13:00', true),
    ]);

    renderWith(queryClient, <TodayWorkerSection today={TODAY} />);

    expect(screen.queryByText('퇴사자')).not.toBeInTheDocument();
  });

  it('데이터가 없고 오류면 formatCommonError 문구를 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient
      .getQueryCache()
      .build(queryClient, { queryKey: scheduleKey })
      .setState({
        status: 'error',
        error: new ApiError('UNKNOWN', 400, '스케쥴을 불러오지 못했어요'),
        fetchStatus: 'idle',
      });

    renderWith(queryClient, <TodayWorkerSection today={TODAY} />);

    expect(screen.getByText('스케쥴을 불러오지 못했어요')).toBeInTheDocument();
  });
});

describe('DashboardHeader', () => {
  it('사용자 이름으로 헤더를 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(userKeys.me(), {
      id: 1,
      email: 'owner@bizsched.com',
      name: '김사장',
    });

    renderWith(queryClient, <DashboardHeader />);

    expect(
      screen.getByRole('heading', { name: '김사장님의 대시보드' }),
    ).toBeInTheDocument();
  });

  it('이름을 불러오지 못하면 대시보드로 표시하고 카드는 그대로 보인다', () => {
    const queryClient = createQueryClient();
    queryClient
      .getQueryCache()
      .build(queryClient, { queryKey: userKeys.me() })
      .setState({
        status: 'error',
        error: new Error('server down'),
        fetchStatus: 'idle',
      });
    queryClient.setQueryData(scheduleKey, [
      createSchedule(1, '신짱구', '12:00', '18:00'),
    ]);

    renderWith(
      queryClient,
      <>
        <DashboardHeader />
        <TodayWorkerSection today={TODAY} />
      </>,
    );

    expect(
      screen.getByRole('heading', { name: '대시보드' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('신짱구')).toHaveLength(2);
  });
});

describe('SalesChartSection', () => {
  const chartKey = salesKeys.chart({ unit: 'MONTH', date: TODAY });
  const createChart = (amount: number): SalesChart => ({
    unit: 'MONTH',
    categories: [{ categoryId: 1, name: '음료', color: '#F26B1D' }],
    rows: [{ label: '1주', totalAmount: amount, '1': amount }],
  });

  it('이번 달 주차별 매출 차트를 그린다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(chartKey, createChart(1000));

    renderWith(queryClient, <SalesChartSection date={TODAY} />);

    expect(
      screen.getByRole('figure', { name: '10월 주차별 매출' }),
    ).toBeInTheDocument();
  });

  it('모든 카테고리 금액이 0이면 매출 데이터가 없습니다를 표시한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(chartKey, createChart(0));

    renderWith(queryClient, <SalesChartSection date={TODAY} />);

    expect(screen.getByText('매출 데이터가 없습니다')).toBeInTheDocument();
    expect(screen.queryByRole('figure')).not.toBeInTheDocument();
  });

  it('자세히 보기는 /sales/dashboard로 이동한다', () => {
    const queryClient = createQueryClient();
    queryClient.setQueryData(chartKey, createChart(1000));

    renderWith(queryClient, <SalesChartSection date={TODAY} />);

    expect(screen.getByRole('link', { name: '자세히 보기' })).toHaveAttribute(
      'href',
      '/sales/dashboard',
    );
  });
});
