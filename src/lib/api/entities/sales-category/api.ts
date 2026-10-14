import { findAll } from '@lib/api/generated/sales-category/sales-category';

import {
  toSalesCategoryList,
  salesCategoryListResponseSchema,
} from './toSalesCategory';

export const getSalesCategories = async (options?: RequestInit) => {
  const response = await findAll(options);
  const dto = salesCategoryListResponseSchema.parse(response);
  return toSalesCategoryList(dto);
};
