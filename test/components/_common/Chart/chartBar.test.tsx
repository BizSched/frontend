import '@testing-library/jest-dom/vitest';
import { cleanup, render } from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

import { ChartBar } from '@components/_common/Chart/ChartBar';

import { ChartProvider } from '@providers/chart/ChartProvider';
import type { ChartConfig } from '@providers/types/chart';

const CONFIG = {
  sales: { label: '상품판매', color: 'red' },
  service: { label: '서비스판매', color: 'blue' },
} satisfies ChartConfig;

const DATA = [{ label: '1주', sales: 100, service: 50 }];

// jsdom은 레이아웃을 계산하지 않아 크기가 0이다. ResponsiveContainer가 크기 0이면
// 차트를 그리지 않으므로, observe 시점에 브라우저처럼 컨테이너 크기를 알려 준다.
beforeAll(() => {
  class ResizeObserverMock {
    constructor(private callback: ResizeObserverCallback) {}
    observe() {
      this.callback(
        [{ contentRect: { width: 320, height: 200 } } as ResizeObserverEntry],
        this as unknown as ResizeObserver,
      );
    }
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserverMock;
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
