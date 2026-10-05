'use client';

import { Chart } from '@components/_common/Chart/Chart';

import {
  SALES_CATEGORIES,
  SALES_MONTH_LABEL,
  SALES_WEEKS,
} from './salesDashboardData';

const SALES_CHART_CONFIG = Object.fromEntries(
  SALES_CATEGORIES.map(({ key, label, color }) => [key, { label, color }]),
);

const WEEKLY_SALES = SALES_WEEKS.map((week) => ({ ...week }));

function SalesWeeklyChart() {
  return (
    <Chart
      config={SALES_CHART_CONFIG}
      data={WEEKLY_SALES}
      aria-label={`${SALES_MONTH_LABEL} 주차별 매출`}
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
