import { findAll } from '@lib/api/generated/sales-category/sales-category';

import {
  toSalesCategoryList,
  salesCategoryListResponseSchema,
} from './toSalesCategory';

export const getSalesCategories = async () => {
  const response = await findAll();
  const dto = salesCategoryListResponseSchema.parse(response);
  return toSalesCategoryList(dto);
};
