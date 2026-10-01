'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card } from '@components/_common/Card/Card';
import { ChartContainer } from '@components/_common/Chart/ChartContainer';

import type { SalesWeek } from './salesDashboardData';

interface SalesChartCardProps {
  weeks: SalesWeek[];
}

const CHART_CONFIG = {
  product: { label: '상품 판매', color: '#ebddb9' },
  service: { label: '서비스', color: '#ffd98a' },
  online: { label: '배달·온라인', color: '#fff0c9' },
  other: { label: '기타', color: '#fff9ed' },
};

const LEGEND = [
  { label: '상품 판매', color: '#ebddb9' },
  { label: '서비스', color: '#ffd98a' },
  { label: '배달·온라인', color: '#fff0c9' },
  { label: '기타', color: '#fff9ed' },
];

function SalesChartCard({ weeks }: SalesChartCardProps) {
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

      <ChartContainer
        config={CHART_CONFIG}
        className="aspect-auto h-[344px] w-full max-tablet:h-[315px]"
        initialDimension={{ width: 720, height: 344 }}
      >
        <BarChart data={weeks} barCategoryGap="20%" accessibilityLayer>
          <CartesianGrid vertical={false} stroke="#e5e5e5" />
          <YAxis
            domain={[0, 8000000]}
            ticks={[0, 4000000, 8000000]}
            tickFormatter={(value: number) =>
              value === 0 ? '0' : `${value / 10000}만`
            }
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 10, fill: '#737373' }}
            width={38}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={{ stroke: '#bbbbbb' }}
            tick={{ fontSize: 10, fill: '#333333' }}
          />
          <Bar
            dataKey="product"
            stackId="sales"
            fill="#ebddb9"
            isAnimationActive={false}
          />
          <Bar
            dataKey="service"
            stackId="sales"
            fill="#ffd98a"
            isAnimationActive={false}
          />
          <Bar
            dataKey="online"
            stackId="sales"
            fill="#fff0c9"
            isAnimationActive={false}
          />
          <Bar
            dataKey="other"
            stackId="sales"
            fill="#fff9ed"
            isAnimationActive={false}
          />
        </BarChart>
      </ChartContainer>

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
        {LEGEND.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1">
            <span
              className="size-2 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </span>
        ))}
      </div>
    </Card>
  );
}

export { SalesChartCard };
