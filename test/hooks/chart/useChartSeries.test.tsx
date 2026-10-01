import { describe, expect, it } from 'vitest';

import { useChartSeries } from '@hooks/chart/useChartSeries';

import type { ChartSeriesConfig } from '@providers/types/chart';

describe('useChartSeries', () => {
  it('config 선언 순서대로 key·label·color를 반환한다', () => {
    const config = {
      product: { label: '상품', color: 'var(--color-primary-700)' },
      service: { label: '서비스', color: 'var(--color-secondary-500)' },
    } satisfies ChartSeriesConfig;

    expect(useChartSeries(config)).toEqual([
      { key: 'product', label: '상품', color: 'var(--color-primary-700)' },
      { key: 'service', label: '서비스', color: 'var(--color-secondary-500)' },
    ]);
  });

  it('빈 config는 빈 배열을 반환한다', () => {
    expect(useChartSeries({})).toEqual([]);
  });
});
