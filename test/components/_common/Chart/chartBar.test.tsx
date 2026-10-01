import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChartBar } from '@components/_common/Chart/ChartBar';

import { ChartProvider } from '@providers/chart/ChartProvider';
import type { ChartSeriesConfig } from '@providers/types/chart';

import { mockResizeObserver } from '@test/helpers/mockResizeObserver';

const CONFIG = {
  sales: { label: '상품판매', color: 'red' },
  service: { label: '서비스판매', color: 'blue' },
} satisfies ChartSeriesConfig;

const DATA = [{ label: '1주', sales: 100, service: 50 }];

beforeAll(() => {
  mockResizeObserver({ width: 320, height: 200 });
});

afterEach(cleanup);

describe('ChartBar', () => {
  it('config 계열 수만큼 Bar를 렌더한다', () => {
    const { container } = render(
      <ChartProvider config={CONFIG} data={DATA} size="large">
        <ChartBar xKey="label" />
      </ChartProvider>,
    );

    const bars = container.querySelectorAll('.recharts-bar');
    expect(bars.length).toBe(2);
  });

  it('isEmpty면 null을 렌더한다', () => {
    const { container } = render(
      <ChartProvider config={CONFIG} data={[]} size="large">
        <ChartBar xKey="label" />
      </ChartProvider>,
    );

    expect(
      container.querySelector('[data-slot="chart"]'),
    ).not.toBeInTheDocument();
  });
});
