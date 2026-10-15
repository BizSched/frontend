'use client';

import { Chart } from '@components/_common/Chart/Chart';

import type { SalesRatio } from '@lib/api/entities/sales/toSalesRatio';

interface SalesCategoryDonutProps {
  ratio: SalesRatio;
  isCompact?: boolean;
}

function SalesCategoryDonut({
  ratio,
  isCompact = false,
}: SalesCategoryDonutProps) {
  const config = Object.fromEntries(
    ratio.items.map(({ categoryId, name, color }) => [
      String(categoryId),
      { label: name, color },
    ]),
  );
  const data = ratio.items.map(({ categoryId, amount }) => ({
    key: String(categoryId),
    amount,
  }));
  const total = `${ratio.totalAmount.toLocaleString('ko-KR')} 원`;
  const ariaLabel = `${Number(ratio.month.slice(5))}월 카테고리별 매출 구성`;

  if (isCompact) {
    return (
      <Chart
        config={config}
        data={data}
        valueKey="amount"
        size="small"
        legend="right"
        aria-label={ariaLabel}
      >
        <Chart.Plot>
          <Chart.Donut nameKey="key" valueKey="amount" />
          <Chart.Center label="총 매출" value={total} />
        </Chart.Plot>
        <Chart.Legend />
      </Chart>
    );
  }

  return (
    <Chart
      config={config}
      data={data}
      valueKey="amount"
      aria-label={ariaLabel}
      className="items-center"
    >
      <Chart.Plot>
        <Chart.Donut nameKey="key" valueKey="amount" />
        <Chart.Center
          label={`${Number(ratio.month.slice(5))}월 매출`}
          value={total}
        />
      </Chart.Plot>
      <Chart.Legend className="justify-center" />
    </Chart>
  );
}

export { SalesCategoryDonut };
