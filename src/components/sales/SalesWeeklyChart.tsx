'use client';

import { Chart } from '@components/_common/Chart/Chart';

import type { SalesChart } from '@lib/api/entities/sales/toSalesChart';

interface SalesWeeklyChartProps {
  chart: SalesChart;
  monthLabel: string;
}

function SalesWeeklyChart({ chart, monthLabel }: SalesWeeklyChartProps) {
  const config = Object.fromEntries(
    chart.categories.map(({ categoryId, name, color }) => [
      String(categoryId),
      { label: name, color },
    ]),
  );

  return (
    <Chart
      config={config}
      data={chart.rows}
      aria-label={`${monthLabel} 주차별 매출`}
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
