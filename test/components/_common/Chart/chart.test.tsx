import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { Chart } from '@components/_common/Chart/Chart';
import { ChartBar } from '@components/_common/Chart/ChartBar';
import { ChartCenter } from '@components/_common/Chart/ChartCenter';
import { ChartDonut } from '@components/_common/Chart/ChartDonut';
import { ChartEmpty } from '@components/_common/Chart/ChartEmpty';
import { ChartPlot } from '@components/_common/Chart/ChartPlot';
import { ChartRoot } from '@components/_common/Chart/ChartRoot';
import { ChartSeriesLegend } from '@components/_common/Chart/ChartSeriesLegend';

import type { ChartSeriesConfig } from '@providers/types/chart';

import { mockResizeObserver } from '@test/helpers/mockResizeObserver';

beforeAll(() => {
  mockResizeObserver({ width: 320, height: 200 });
});

afterEach(cleanup);

const CONFIG = {
  product: { label: '상품', color: 'red' },
} satisfies ChartSeriesConfig;

describe('Chart', () => {
  it('Root와 서브컴포넌트가 각 구현과 동일 참조다', () => {
    expect(Chart).toBe(ChartRoot);
    expect(Chart.Plot).toBe(ChartPlot);
    expect(Chart.Bar).toBe(ChartBar);
    expect(Chart.Donut).toBe(ChartDonut);
    expect(Chart.Center).toBe(ChartCenter);
    expect(Chart.Legend).toBe(ChartSeriesLegend);
    expect(Chart.Empty).toBe(ChartEmpty);
  });

  it('막대 조합을 렌더하고 빈 상태 전환 시 슬롯 표시가 바뀐다', () => {
    const { rerender } = render(
      <Chart
        config={CONFIG}
        data={[{ label: '1주', product: 100 }]}
        aria-label="차트"
      >
        <Chart.Plot>
          <Chart.Bar xKey="label" />
        </Chart.Plot>
        <Chart.Legend />
        <Chart.Empty>empty-state</Chart.Empty>
      </Chart>,
    );

    expect(screen.queryByText('empty-state')).not.toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();

    rerender(
      <Chart config={CONFIG} data={[]} aria-label="차트">
        <Chart.Plot>
          <Chart.Bar xKey="label" />
        </Chart.Plot>
        <Chart.Legend />
        <Chart.Empty>empty-state</Chart.Empty>
      </Chart>,
    );

    expect(screen.getByText('empty-state')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
