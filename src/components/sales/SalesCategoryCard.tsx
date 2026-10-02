'use client';

import { Card } from '@components/_common/Card/Card';
import { Chart } from '@components/_common/Chart/Chart';

import { SALES_CATEGORIES } from './salesDashboardData';

const CATEGORY_CHART_CONFIG = Object.fromEntries(
  SALES_CATEGORIES.map(({ key, label, color }) => [key, { label, color }]),
);

const CATEGORY_SALES = SALES_CATEGORIES.map(({ key, amount }) => ({
  key,
  amount,
}));

function SalesCategoryCard() {
  return (
    <Card
      radius="2xl"
      padding="lg"
      className="h-[518px] shadow-[0_0_30px_rgba(0,0,0,0.05)] max-tablet:order-1 max-tablet:h-[305px] max-tablet:p-5"
    >
      <Card.Header className="flex-col gap-0">
        <Card.Title className="text-2xl font-semibold text-slate-900 max-tablet:text-lg">
          카테고리 구성
        </Card.Title>
        <p className="text-base font-semibold text-slate-500 max-tablet:text-xs">
          10월 누계
        </p>
      </Card.Header>

      <div className="flex min-h-0 flex-1 items-center justify-center max-tablet:hidden">
        <Chart
          config={CATEGORY_CHART_CONFIG}
          data={CATEGORY_SALES}
          valueKey="amount"
          aria-label="10월 카테고리별 매출 구성"
          className="items-center"
        >
          <Chart.Plot>
            <Chart.Donut nameKey="key" valueKey="amount" />
            <Chart.Center label="10월 매출" value="000,000,000 원" />
          </Chart.Plot>
          <Chart.Legend className="justify-center" />
        </Chart>
      </div>

      <div className="hidden min-h-0 flex-1 items-center justify-center max-tablet:flex">
        <Chart
          config={CATEGORY_CHART_CONFIG}
          data={CATEGORY_SALES}
          valueKey="amount"
          size="small"
          legend="right"
          aria-label="10월 카테고리별 매출 구성"
        >
          <Chart.Plot>
            <Chart.Donut nameKey="key" valueKey="amount" />
            <Chart.Center label="총 매출" value="000,000,000 원" />
          </Chart.Plot>
          <Chart.Legend />
        </Chart>
      </div>
    </Card>
  );
}

export { SalesCategoryCard };
