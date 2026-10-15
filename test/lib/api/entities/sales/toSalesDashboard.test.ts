import { describe, expect, it } from 'vitest';

import { toSalesChart } from '@lib/api/entities/sales/toSalesChart';
import { toSalesRatio } from '@lib/api/entities/sales/toSalesRatio';
import { toSalesSummary } from '@lib/api/entities/sales/toSalesSummary';

const SUMMARY = {
  month: '2026-09',
  startDate: '2026-09-01',
  endDate: '2026-09-19',
  totalAmount: 1000000,
  previousMonth: { totalAmount: 800000, changeRate: 25 },
  previousYear: { totalAmount: 1150000, changeAmount: -150000 },
};
const CATEGORIES = [
  { categoryId: 1, name: '음료', color: '#F26B1D' },
  { categoryId: 2, name: '디저트', color: '#F2A71D' },
];
const CHART = {
  unit: 'MONTH' as const,
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  categories: CATEGORIES,
  items: [
    {
      label: '1주',
      startDate: '2026-09-01',
      endDate: '2026-09-06',
      sales: [
        { categoryId: 1, amount: 300000 },
        { categoryId: 2, amount: 0 },
      ],
      totalAmount: 300000,
    },
    {
      label: '2주',
      startDate: '2026-09-07',
      endDate: '2026-09-13',
      sales: [],
      totalAmount: 0,
    },
  ],
};

describe('toSalesSummary', () => {
  it('changeRate가 없거나 null이면 null로 정규화한다', () => {
    expect(
      toSalesSummary({ ...SUMMARY, previousMonth: { totalAmount: 0 } })
        .previousMonth.changeRate,
    ).toBeNull();
    expect(
      toSalesSummary({
        ...SUMMARY,
        previousMonth: { totalAmount: 0, changeRate: null },
      }).previousMonth.changeRate,
    ).toBeNull();
  });

  it('음수 증감액을 그대로 유지한다', () => {
    expect(toSalesSummary(SUMMARY).previousYear.changeAmount).toBe(-150000);
  });
});

describe('toSalesChart', () => {
  it('차트 bucket을 categoryId 키를 가진 행으로 펼친다', () => {
    expect(toSalesChart(CHART).rows[0]).toEqual({
      label: '1주',
      totalAmount: 300000,
      '1': 300000,
      '2': 0,
    });
  });

  it('매출이 없는 bucket도 모든 카테고리를 0으로 채운다', () => {
    expect(toSalesChart(CHART).rows[1]).toEqual({
      label: '2주',
      totalAmount: 0,
      '1': 0,
      '2': 0,
    });
  });
});

describe('toSalesRatio', () => {
  it('ratio 항목은 응답 순서를 유지한다', () => {
    const items = [
      { ...CATEGORIES[1], amount: 400, percent: 40 },
      {
        categoryId: 9,
        name: '삭제됨',
        color: '#999999',
        amount: 600,
        percent: 60,
      },
    ];

    expect(
      toSalesRatio({ month: '2026-09', totalAmount: 1000, items }).items.map(
        ({ categoryId }) => categoryId,
      ),
    ).toEqual([2, 9]);
  });
});
