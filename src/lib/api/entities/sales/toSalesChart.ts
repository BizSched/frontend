import type { z } from 'zod';

import { FindChartResponse as salesChartResponseSchema } from '@lib/api/generated/index.zod';

type SalesChartDto = z.infer<typeof salesChartResponseSchema>;

export { salesChartResponseSchema };

export interface SalesChart {
  unit: SalesChartDto['unit'];
  categories: { categoryId: number; name: string; color: string }[];
  rows: ({ label: string; totalAmount: number } & Record<
    string,
    number | string
  >)[];
}

export const toSalesChart = (dto: SalesChartDto): SalesChart => ({
  unit: dto.unit,
  categories: dto.categories.map(({ categoryId, name, color }) => ({
    categoryId,
    name,
    color,
  })),
  rows: dto.items.map((item) => ({
    ...Object.fromEntries(
      dto.categories.map(({ categoryId }) => [String(categoryId), 0]),
    ),
    ...Object.fromEntries(
      item.sales.map(({ categoryId, amount }) => [String(categoryId), amount]),
    ),
    label: item.label,
    totalAmount: item.totalAmount,
  })),
});
