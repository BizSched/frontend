import type { z } from 'zod';

import { UpdateResponse as saleResponseSchema } from '@lib/api/generated/index.zod';

export { saleResponseSchema };

type SaleDto = z.infer<typeof saleResponseSchema>;

export interface Sale {
  id: number;
  date: string;
  sales: {
    categoryId: number;
    name: string;
    amount: number;
  }[];
  totalAmount: number;
}

export const toSale = (dto: SaleDto): Sale => ({
  ...dto,
});
