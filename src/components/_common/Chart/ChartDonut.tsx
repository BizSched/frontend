'use client';

import { Cell, Pie, PieChart } from 'recharts';

import { useChartContext } from '@hooks/chart/useChartContext';
import { useChartSeries } from '@hooks/chart/useChartSeries';

import type { ChartSize } from '@providers/types/chart';

import { ChartContainer } from './ChartContainer';

const DONUT_RADIUS: Record<ChartSize, { inner: number; outer: number }> = {
  large: { inner: 79, outer: 126 },
  small: { inner: 48, outer: 76 },
};

interface ChartDonutProps {
  nameKey: string;
}

function ChartDonut({ nameKey }: ChartDonutProps) {
  const { config, data, valueKey, size, isEmpty } = useChartContext();
  const series = useChartSeries(config);
  const { inner, outer } = DONUT_RADIUS[size];

  if (isEmpty) {
    return (
      <ChartContainer config={config}>
        <PieChart>
          <Pie
            data={[{ [nameKey]: 'empty', value: 1 }]}
            dataKey="value"
            nameKey={nameKey}
            innerRadius={inner}
            outerRadius={outer}
            fill="var(--color-slate-200)"
            stroke="none"
          />
        </PieChart>
      </ChartContainer>
    );
  }

  // long 포맷(행 하나 = 계열 하나): nameKey로 각 행이 어느 계열인지 찾아 Cell 색을 매핑한다.
  const dataKey = valueKey ?? series[0]?.key;

  return (
    <ChartContainer config={config}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          innerRadius={inner}
          outerRadius={outer}
        >
          {data.map((row, index) => {
            const seriesKey = String(row[nameKey]);
            const color = series.find(({ key }) => key === seriesKey)?.color;
            return <Cell key={`${seriesKey}-${index}`} fill={color} />;
          })}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export { ChartDonut };
