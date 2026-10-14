import type { z } from 'zod';

import { FindAllResponse as salesCategoryListResponseSchema } from '@lib/api/generated/index.zod';

export { salesCategoryListResponseSchema };

type SalesCategoryListDto = z.infer<typeof salesCategoryListResponseSchema>;

export interface SalesCategory {
  id: number;
  name: string;
  color: string;
  order: number;
}

export const toSalesCategoryList = (
  dto: SalesCategoryListDto,
): SalesCategory[] => dto.items;
