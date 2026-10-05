// @vitest-environment node
import { describe, expect, it } from 'vitest';

import {
  SALES_CATEGORIES,
  SALES_RECORDS,
  SALES_WEEKS,
} from '@components/sales/salesDashboardData';

import { createSalesDemoMonth } from '@lib/utilities/sales/salesDemo';

describe('sales demo data', () => {
  it('generates reproducible calendar dates including leap days', () => {
    const records = createSalesDemoMonth(2024, 2);
    expect(records).toHaveLength(29);
    expect(records.at(-1)).toMatchObject({ date: '2월 29일', day: '목' });
    expect(createSalesDemoMonth(2024, 2)).toEqual(records);
  });
  it('shows eight distinct recent dates with accurate totals', () => {
    expect(SALES_RECORDS).toHaveLength(8);
    expect(new Set(SALES_RECORDS.map((record) => record.date)).size).toBe(8);
    for (const record of SALES_RECORDS) {
      expect(record.total).toBe(
        record.product + record.service + record.online + record.other,
      );
    }
  });

  it('reconciles category and weekly revenue', () => {
    const weeklyTotal = SALES_WEEKS.reduce(
      (sum, week) =>
        sum + week.product + week.service + week.online + week.other,
      0,
    );
    expect(
      SALES_CATEGORIES.reduce((sum, category) => sum + category.amount, 0),
    ).toBe(weeklyTotal);
    expect(weeklyTotal).toBeGreaterThan(1000000);
  });
});
