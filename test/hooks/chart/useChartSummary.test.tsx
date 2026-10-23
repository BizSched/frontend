import { describe, expect, it } from 'vitest';

import { useChartSummary } from '@hooks/chart/useChartSummary';

import type { ChartSeriesConfig } from '@providers/types/chart';

const wideConfig = {
  sales: { label: '판매', color: 'red' },
  service: { label: '서비스', color: 'blue' },
} satisfies ChartSeriesConfig;

describe('useChartSummary', () => {
  it('wide 형태: valueKey 없이 config 키 값 합을 계산한다', () => {
    const result = useChartSummary(
      [
        { sales: 100, service: 50 },
        { sales: 0, service: 0 },
      ],
      wideConfig,
    );

    expect(result).toEqual({ total: 150, isEmpty: false });
  });

  it('long 형태: valueKey 컬럼 합을 계산한다', () => {
    const result = useChartSummary(
      [
        { category: 'a', amount: 10 },
        { category: 'b', amount: 20 },
      ],
      { a: { label: 'A', color: 'red' }, b: { label: 'B', color: 'blue' } },
      'amount',
    );

    expect(result).toEqual({ total: 30, isEmpty: false });
  });

  it('빈 배열이면 isEmpty다', () => {
    expect(useChartSummary([], wideConfig)).toEqual({
      total: 0,
      isEmpty: true,
    });
  });

  it('모든 값의 합이 0이면 isEmpty다', () => {
    const result = useChartSummary([{ sales: 0, service: 0 }], wideConfig);

    expect(result).toEqual({ total: 0, isEmpty: true });
  });

  it('일부 값이 누락되어도 나머지로 합을 계산한다', () => {
    const result = useChartSummary([{ sales: 100 }], wideConfig);

    expect(result).toEqual({ total: 100, isEmpty: false });
  });

  it('config에 계열이 없으면 data가 있어도 isEmpty다', () => {
    const result = useChartSummary([{ sales: 100 }], {});

    expect(result).toEqual({ total: 0, isEmpty: true });
  });
});
