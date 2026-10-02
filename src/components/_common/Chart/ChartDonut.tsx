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

// 도넛은 long 포맷(행 하나 = 계열 하나) 전용이라 행의 계열 컬럼(nameKey)과 값 컬럼(valueKey)이 모두 필요하다.
interface ChartDonutProps {
  nameKey: string;
  valueKey: string;
}

function ChartDonut({ nameKey, valueKey }: ChartDonutProps) {
  const { config, data, size, isEmpty } = useChartContext();
  const series = useChartSeries(config);
  const { inner, outer } = DONUT_RADIUS[size];
  // 반지름이 고정 px이므로 컨테이너도 바깥 지름 정사각형으로 고정한다 (기본 aspect-video면 잘린다).
  const containerStyle = { width: outer * 2, height: outer * 2 };

  if (isEmpty) {
    return (
      <ChartContainer
        config={config}
        className="mx-auto aspect-auto"
        style={containerStyle}
      >
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

  // long 포맷(행 하나 = 계열 하나): config 선언 순서로 행을 다시 세워 범례와 순서를 맞추고,
  // config에 없는 계열의 행은 범례에 없는 조각이 되므로 그리지 않는다.
  const slices = series.flatMap(({ key, color }) =>
    data
      .filter((row) => row[nameKey] === key)
      .map((row) => ({ row, key, color })),
  );

  return (
    <ChartContainer
      config={config}
      className="mx-auto aspect-auto"
      style={containerStyle}
    >
      <PieChart>
        <Pie
          data={slices.map(({ row }) => row)}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={inner}
          outerRadius={outer}
          startAngle={90}
          endAngle={-270}
        >
          {slices.map(({ key, color }, index) => (
            <Cell key={`${key}-${index}`} fill={color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}

export { ChartDonut };
