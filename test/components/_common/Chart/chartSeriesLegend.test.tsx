import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ChartSeriesLegend } from '@components/_common/Chart/ChartSeriesLegend';

import { ChartProvider } from '@providers/chart/ChartProvider';
import type { ChartConfig, ChartSize } from '@providers/types/chart';

const CONFIG = {
  product: { label: '상품', color: 'red' },
  service: { label: '서비스', color: 'blue' },
} satisfies ChartConfig;

afterEach(cleanup);

const renderLegend = (size: ChartSize, data: Record<string, unknown>[]) =>
  render(
    <ChartProvider config={CONFIG} data={data} size={size}>
      <ChartSeriesLegend />
    </ChartProvider>,
  );

describe('ChartSeriesLegend', () => {
  it('config 순서대로 ul·li를 렌더하고 색 칩은 aria-hidden이다', () => {
    renderLegend('large', [{}]);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('상품');
    expect(items[1]).toHaveTextContent('서비스');

    const chip = items[0].querySelector('[aria-hidden="true"]');
    expect(chip).toHaveStyle({ backgroundColor: 'rgb(255, 0, 0)' });
  });

  it.each([
    {
      size: 'large',
      list: ['text-sm', 'gap-4'],
      chip: ['size-2.5', 'rounded-[3px]'],
    },
    {
      size: 'small',
      list: ['text-[0.625rem]', 'leading-3', 'gap-2.5'],
      chip: ['size-2', 'rounded-[2px]'],
    },
  ] as const)(
    'Context size가 $size 일 때 차트 종류와 관계없이 같은 글자·칩·간격을 적용한다',
    ({ size, list, chip }) => {
      renderLegend(size, [{}]);

      expect(screen.getByRole('list')).toHaveClass('font-medium', ...list);
      expect(screen.getAllByRole('listitem')[0]).toHaveClass('gap-1');
      expect(
        screen
          .getAllByRole('listitem')[0]
          .querySelector('[aria-hidden="true"]'),
      ).toHaveClass(...chip);
    },
  );

  it('isEmpty면 null을 렌더한다', () => {
    renderLegend('large', []);

    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
