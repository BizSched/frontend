import type { z } from 'zod';

import { FindAll3Response as salesListResponseSchema } from '@lib/api/generated/index.zod';

import { toSale, type Sale } from './toSale';

type SalesListDto = z.infer<typeof salesListResponseSchema>;

export { salesListResponseSchema };

export interface SalesList {
  page: number;
  size: number;
  items: Sale[];
  totalCount: number;
  totalPage: number;
}

export const toSalesList = (dto: SalesListDto): SalesList => ({
  page: dto.page,
  size: dto.size,
  items: dto.items.map(toSale),
  totalCount: dto.totalCount,
  totalPage: dto.totalPage,
});
