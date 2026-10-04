'use client';

import { Chart } from '@components/_common/Chart/Chart';

import { SALES_WEEKS } from './salesDashboardData';

const SALES_CHART_CONFIG = {
  product: { label: '상품 판매', color: '#ebddb9' },
  service: { label: '서비스', color: '#ffd98a' },
  online: { label: '배달·온라인', color: '#fff0c9' },
  other: { label: '기타', color: '#fff9ed' },
};

const WEEKLY_SALES = SALES_WEEKS.map((week) => ({ ...week }));

function SalesWeeklyChart() {
  return (
    <Chart
      config={SALES_CHART_CONFIG}
      data={WEEKLY_SALES}
      aria-label="9월 주차별 매출"
      className="min-h-0 flex-1"
    >
      <Chart.Plot className="min-h-0 flex-1 [&_[data-slot=chart]]:aspect-auto [&_[data-slot=chart]]:h-full">
        <Chart.Bar xKey="label" />
      </Chart.Plot>
      <Chart.Legend className="border-t border-slate-100 pt-2 max-tablet:justify-center" />
    </Chart>
  );
}

export { SalesWeeklyChart };
