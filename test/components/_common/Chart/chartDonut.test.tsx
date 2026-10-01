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
import type { ChartConfig } from '@providers/types/chart';

import { mockResizeObserver } from '@test/helpers/mockResizeObserver';

const CONFIG = {
  product: { label: '상품', color: 'var(--color-primary-700)' },
  service: { label: '서비스', color: 'var(--color-secondary-500)' },
} satisfies ChartConfig;

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

describe('ChartDonut', () => {
  it('계열 수만큼 조각을 렌더하고 nameKey로 계열 색을 매핑한다', () => {
    const { container } = render(
      <ChartProvider config={CONFIG} data={DATA} valueKey="amount" size="large">
        <ChartDonut nameKey="category" />
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
      <ChartProvider config={CONFIG} data={[]} valueKey="amount" size="large">
        <ChartDonut nameKey="category" />
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
          data={DATA}
          valueKey="amount"
          size={size}
        >
          <ChartDonut nameKey="category" />
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
          data={DATA}
          valueKey="amount"
          size={size}
        >
          <ChartDonut nameKey="category" />
        </ChartProvider>,
      );

      expect(container.querySelector('[data-slot="chart"]')).toHaveStyle({
        width: diameter,
        height: diameter,
      });
    },
  );
});
