import type { z } from 'zod';

import { FindRatioResponse as salesRatioResponseSchema } from '@lib/api/generated/index.zod';

type SalesRatioDto = z.infer<typeof salesRatioResponseSchema>;

export { salesRatioResponseSchema };

export interface SalesRatio {
  month: string;
  totalAmount: number;
  items: {
    categoryId: number;
    name: string;
    color: string;
    amount: number;
    percent: number;
  }[];
}

export const toSalesRatio = (dto: SalesRatioDto): SalesRatio => ({
  month: dto.month,
  totalAmount: dto.totalAmount,
  items: dto.items.map(({ categoryId, name, color, amount, percent }) => ({
    categoryId,
    name,
    color,
    amount,
    percent,
  })),
});
