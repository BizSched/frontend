'use client';

import Image from 'next/image';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { ChartContainer } from '@components/_common/Chart/ChartContainer';
import { ChartLegend } from '@components/_common/Chart/ChartLegend';
import { ChartLegendContent } from '@components/_common/Chart/ChartLegendContent';
import { ChartTooltip } from '@components/_common/Chart/ChartTooltip';
import { ChartTooltipContent } from '@components/_common/Chart/ChartTooltipContent';

import type { ChartConfig } from '@providers/types/chart';

import IcEmpty from '@assets/icons/ic_empty.svg';

const chartData = [
  { dataKey: '1주', sales: 200, service: 150, online: 100, etc: 50 },
  { dataKey: '2주', sales: 200, service: 150, online: 500, etc: 50 },
  { dataKey: '3주', sales: 210, service: 125, online: 300, etc: 50 },
  { dataKey: '4주', sales: 400, service: 350, online: 100, etc: 50 },
  { dataKey: '5주', sales: 210, service: 450, online: 100, etc: 50 },
];

const chartConfig = {
  sales: {
    label: '상품판매',
    color: 'var(--chart-1)',
  },
  service: {
    label: '서비스판매',
    color: 'var(--chart-2)',
  },
  online: {
    label: '배달·온라인',
    color: 'var(--chart-3)',
  },
  etc: {
    label: '기타',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig;

const isAllSeriesZero = <T extends Record<string, unknown>>(
  data: readonly T[],
  seriesKeys: readonly (keyof T)[],
): boolean =>
  data.every((row) => seriesKeys.every((key) => Number(row[key] ?? 0) === 0));

export function StackedChart() {
  const isEmpty = isAllSeriesZero(
    chartData,
    Object.keys(chartConfig) as Array<keyof typeof chartConfig>,
  );
  if (isEmpty) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex min-h-[270px] flex-col items-center justify-center gap-2 max-tablet:min-h-0">
          <Image
            src={IcEmpty}
            alt="empty-chart"
            width={100}
            height={128}
            unoptimized
          />
          <span className="text-base font-semibold text-slate-400">
            매출 데이터가 없습니다
          </span>
        </div>
      </div>
    );
  }
  return (
    <ChartContainer config={chartConfig}>
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} />
        <YAxis tickLine={false} tickMargin={10} axisLine={false} />
        <XAxis
          dataKey="dataKey"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(0, 3)}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <ChartLegend
          itemSorter={null}
          content={<ChartLegendContent />}
          align="left"
        />
        {(Object.keys(chartConfig) as Array<keyof typeof chartConfig>).map(
          (key, index) => (
            <Bar
              key={`${index}-${key}`}
              dataKey={key}
              stackId="a"
              fill={chartConfig[key].color}
              radius={[0, 0, 0, 0]}
            />
          ),
        )}
      </BarChart>
    </ChartContainer>
  );
}
