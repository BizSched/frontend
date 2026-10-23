'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { useChartContext } from '@hooks/chart/useChartContext';
import { useChartSeries } from '@hooks/chart/useChartSeries';

import { formatCompactKrw } from '@lib/utilities/formatCompactKrw';

import { ChartContainer } from './ChartContainer';

interface ChartBarProps {
  xKey: string;
  tickFormatter?: (value: number) => string;
}

function ChartBar({ xKey, tickFormatter = formatCompactKrw }: ChartBarProps) {
  const { config, data, isEmpty } = useChartContext();
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
            radius={[0, 0, 0, 0]}
          />
        ))}
      </BarChart>
    </ChartContainer>
  );
}

export { ChartBar };
