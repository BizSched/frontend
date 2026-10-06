import '@testing-library/jest-dom/vitest';
import { act, cleanup, render } from '@testing-library/react';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { ChartDonut } from '@components/_common/Chart/ChartDonut';

import { ChartProvider } from '@providers/chart/ChartProvider';
import type { ChartSeriesConfig } from '@providers/types/chart';

import { mockResizeObserver } from '@test/helpers/mockResizeObserver';

const CONFIG = {
  product: { label: '상품', color: 'var(--color-primary-700)' },
  service: { label: '서비스', color: 'var(--color-secondary-500)' },
} satisfies ChartSeriesConfig;

const DATA = [
  { category: 'product', amount: 100 },
  { category: 'service', amount: 50 },
];

beforeAll(() => {
  mockResizeObserver({ width: 320, height: 200 });
});

// recharts는 조각을 각도 0에서 펼치는 애니메이션으로 그린다. jsdom에서는 프레임이
// 진행되지 않아 조각이 그려지지 않으므로, 가짜 타이머로 애니메이션을 끝까지 진행한다.
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

const finishAnimation = () => {
  act(() => {
    vi.advanceTimersByTime(3000);
  });
};

const getSectorFills = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('.recharts-pie-sector path')).map(
    (path) => path.getAttribute('fill'),
  );

// 조각 path의 호(A rx,ry ...)에서 반지름을 읽는다. 바깥 → 안쪽 순서로 중복 없이 반환한다.
const getArcRadii = (container: HTMLElement) => {
  const d = Array.from(container.querySelectorAll('.recharts-pie-sector path'))
    .map((path) => path.getAttribute('d') ?? '')
    .join(' ');
  const radii = Array.from(d.matchAll(/A\s*([\d.]+),/g), ([, r]) => Number(r));
  return [...new Set(radii)].sort((a, b) => b - a);
};

// 첫 조각 path의 시작점(M)과 바깥 호(A)의 끝점, 차트 중심을 svg 좌표로 읽는다.
const getFirstSectorOuterArc = (container: HTMLElement) => {
  const svg = container.querySelector('svg');
  const d =
    container.querySelector('.recharts-pie-sector path')?.getAttribute('d') ??
    '';
  const [mx, my] = (d.match(/M\s*([-\d.]+),([-\d.]+)/) ?? []).slice(1, 3);
  const arc = d
    .match(/A\s*([-\d.,\s]+?)L/)?.[1]
    .split(/[\s,]+/)
    .filter(Boolean);
  return {
    center: {
      x: Number(svg?.getAttribute('width')) / 2,
      y: Number(svg?.getAttribute('height')) / 2,
    },
    start: { x: Number(mx), y: Number(my) },
    end: { x: Number(arc?.[5]), y: Number(arc?.[6]) },
  };
};

describe('ChartDonut', () => {
  it('data 행 순서와 관계없이 config 선언 순서로 조각을 그린다', () => {
    const { container } = render(
      <ChartProvider
        config={CONFIG}
        valueKey="amount"
        data={[...DATA].reverse()}
        size="large"
      >
        <ChartDonut nameKey="category" valueKey="amount" />
      </ChartProvider>,
    );

    finishAnimation();

    expect(getSectorFills(container)).toEqual([
      'var(--color-primary-700)',
      'var(--color-secondary-500)',
    ]);
  });

  it('config에 없는 nameKey 값의 행은 그리지 않는다', () => {
    const { container } = render(
      <ChartProvider
        config={CONFIG}
        valueKey="amount"
        data={[...DATA, { category: 'unknown', amount: 30 }]}
        size="large"
      >
        <ChartDonut nameKey="category" valueKey="amount" />
      </ChartProvider>,
    );

    finishAnimation();

    expect(getSectorFills(container)).toHaveLength(2);
  });

  it('12시 방향에서 시작해 시계 방향으로 그린다', () => {
    const { container } = render(
      <ChartProvider
        config={CONFIG}
        valueKey="amount"
        data={[
          { category: 'product', amount: 25 },
          { category: 'service', amount: 75 },
        ]}
        size="large"
      >
        <ChartDonut nameKey="category" valueKey="amount" />
      </ChartProvider>,
    );

    finishAnimation();

    const { center, start, end } = getFirstSectorOuterArc(container);
    // 시작점: 중심 바로 위(12시), 바깥 반지름 126
    expect(start.x).toBeCloseTo(center.x, 0);
    expect(start.y).toBeCloseTo(center.y - 126, 0);
    // 25% 조각이 시계 방향이면 3시(중심 오른쪽)에서 끝난다
    expect(end.x).toBeCloseTo(center.x + 126, 0);
    expect(end.y).toBeCloseTo(center.y, 0);
  });

  it('계열 수만큼 조각을 렌더하고 nameKey로 계열 색을 매핑한다', () => {
    const { container } = render(
      <ChartProvider config={CONFIG} valueKey="amount" data={DATA} size="large">
        <ChartDonut nameKey="category" valueKey="amount" />
      </ChartProvider>,
    );

    finishAnimation();

    expect(getSectorFills(container)).toEqual([
      'var(--color-primary-700)',
      'var(--color-secondary-500)',
    ]);
  });

  it('isEmpty면 slate-200 단색 링을 렌더한다', () => {
    const { container } = render(
      <ChartProvider config={CONFIG} valueKey="amount" data={[]} size="large">
        <ChartDonut nameKey="category" valueKey="amount" />
      </ChartProvider>,
    );

    finishAnimation();

    expect(getSectorFills(container)).toEqual(['var(--color-slate-200)']);
  });

  it.each([
    { size: 'large', radii: [126, 79] },
    { size: 'small', radii: [76, 48] },
  ] as const)(
    'size가 $size 일 때 바깥·안쪽 반지름은 $radii',
    ({ size, radii }) => {
      const { container } = render(
        <ChartProvider
          config={CONFIG}
          valueKey="amount"
          data={DATA}
          size={size}
        >
          <ChartDonut nameKey="category" valueKey="amount" />
        </ChartProvider>,
      );

      finishAnimation();

      expect(getArcRadii(container)).toEqual(radii);
    },
  );

  it.each([
    { size: 'large', diameter: '252px' },
    { size: 'small', diameter: '152px' },
  ] as const)(
    'size가 $size 일 때 컨테이너를 바깥 지름 $diameter 정사각형으로 고정한다',
    ({ size, diameter }) => {
      const { container } = render(
        <ChartProvider
          config={CONFIG}
          valueKey="amount"
          data={DATA}
          size={size}
        >
          <ChartDonut nameKey="category" valueKey="amount" />
        </ChartProvider>,
      );

      expect(container.querySelector('[data-slot="chart"]')).toHaveStyle({
        width: diameter,
        height: diameter,
      });
    },
  );
});
