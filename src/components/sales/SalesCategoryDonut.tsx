'use client';

import { Chart } from '@components/_common/Chart/Chart';

import { SALES_CATEGORIES } from './salesDashboardData';

interface SalesCategoryDonutProps {
  isCompact?: boolean;
}

const CATEGORY_CHART_CONFIG = Object.fromEntries(
  SALES_CATEGORIES.map(({ key, label, color }) => [key, { label, color }]),
);

const CATEGORY_SALES = SALES_CATEGORIES.map(({ key, amount }) => ({
  key,
  amount,
}));

function SalesCategoryDonut({ isCompact = false }: SalesCategoryDonutProps) {
  if (isCompact) {
    return (
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
    );
  }

  return (
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
  );
}

export { SalesCategoryDonut };
