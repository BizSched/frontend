import type { z } from 'zod';

import { FindSummaryResponse as salesSummaryResponseSchema } from '@lib/api/generated/index.zod';

type SalesSummaryDto = z.infer<typeof salesSummaryResponseSchema>;

export { salesSummaryResponseSchema };

export interface SalesSummary {
  month: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  previousMonth: { totalAmount: number; changeRate: number | null };
  previousYear: { totalAmount: number; changeAmount: number };
}

export const toSalesSummary = (dto: SalesSummaryDto): SalesSummary => ({
  month: dto.month,
  startDate: dto.startDate,
  endDate: dto.endDate,
  totalAmount: dto.totalAmount,
  previousMonth: {
    totalAmount: dto.previousMonth.totalAmount,
    changeRate: dto.previousMonth.changeRate ?? null,
  },
  previousYear: {
    totalAmount: dto.previousYear.totalAmount,
    changeAmount: dto.previousYear.changeAmount,
  },
});
