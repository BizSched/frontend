'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { useChartContext } from '@hooks/chart/useChartContext';
import { useChartSeries } from '@hooks/chart/useChartSeries';

import type { ChartSize } from '@providers/types/chart';

import { formatCompactKrw } from '@lib/utilities/formatCompactKrw';

import { ChartContainer } from './ChartContainer';

// TODO: Figma(103:176038) 측정 전 임시값. 측정 후 교체하고 설계 문서 size 표에도 반영한다.
const BAR_SIZE: Record<ChartSize, number> = {
  large: 24,
  small: 8,
};

interface ChartBarProps {
  xKey: string;
  tickFormatter?: (value: number) => string;
}

function ChartBar({ xKey, tickFormatter = formatCompactKrw }: ChartBarProps) {
  const { config, data, isEmpty, size } = useChartContext();
  const series = useChartSeries(config);

  if (isEmpty) {
    return null;
  }

  return (
    <ChartContainer config={config}>
      <BarChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} stroke="var(--color-slate-100)" />
        <YAxis
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value: number) => tickFormatter(value)}
        />
        <XAxis
          dataKey={xKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        {series.map(({ key, color }) => (
          <Bar
            key={key}
            dataKey={key}
            stackId="chart"
            fill={color}
            barSize={BAR_SIZE[size]}
            radius={[0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export { ChartBar };
