'use client';

import { Card } from '@components/_common/Card/Card';
import { Chart } from '@components/_common/Chart/Chart';

import { SALES_WEEKS } from './salesDashboardData';

const SALES_CHART_CONFIG = {
  product: { label: '상품 판매', color: '#ebddb9' },
  service: { label: '서비스', color: '#ffd98a' },
  online: { label: '배달·온라인', color: '#fff0c9' },
  other: { label: '기타', color: '#fff9ed' },
};

const WEEKLY_SALES = SALES_WEEKS.map((week) => ({ ...week }));

function SalesChartCard() {
  return (
    <Card
      radius="2xl"
      padding="lg"
      className="h-[518px] gap-3 shadow-[0_0_30px_rgba(0,0,0,0.05)] max-tablet:order-2 max-tablet:h-[480px] max-tablet:p-5"
    >
      <Card.Header className="items-center max-tablet:items-start">
        <div className="flex items-center gap-3">
          <Card.Title className="text-2xl font-semibold text-slate-950 max-tablet:text-lg">
            매출 차트
          </Card.Title>
          <span className="rounded-full border border-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 max-tablet:text-xs">
            9월 <span aria-hidden="true">⌄</span>
          </span>
        </div>
        <div className="flex items-center rounded-lg bg-slate-50 p-[3px] text-xs font-medium max-tablet:hidden">
          <span className="px-3 py-2">주</span>
          <span className="rounded-md bg-primary-100 px-3 py-2 shadow-sm">
            월
          </span>
          <span className="px-3 py-2">연</span>
        </div>
      </Card.Header>

      <div className="hidden self-end rounded-lg bg-slate-50 p-[3px] text-xs font-medium max-tablet:flex">
        <span className="rounded-md bg-primary-100 px-3 py-2 shadow-sm">
          일간
        </span>
        <span className="px-3 py-2">주간</span>
        <span className="px-3 py-2">월간</span>
      </div>

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
    </Card>
  );
}

export { SalesChartCard };
