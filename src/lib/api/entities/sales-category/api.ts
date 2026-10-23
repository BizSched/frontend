import type { SalesCategoryItemRequest } from '@lib/api/generated/bizSchedAPI.schemas';
import {
  create,
  delete4,
  findAll,
  updateAll,
} from '@lib/api/generated/sales-category/sales-category';
import {
  CreateResponse as salesCategoryResponseSchema,
  UpdateAllResponse,
} from '@lib/api/generated/sales-category/sales-category.zod';

import {
  toSalesCategoryList,
  salesCategoryListResponseSchema,
} from './toSalesCategory';

export const getSalesCategories = async (options?: RequestInit) => {
  const response = await findAll(options);
  const dto = salesCategoryListResponseSchema.parse(response);
  return toSalesCategoryList(dto);
};

export const createSalesCategory = async (name: string) => {
  const response = await create({ name });
  return salesCategoryResponseSchema.parse(response);
};

export const updateSalesCategories = async (
  categories: SalesCategoryItemRequest[],
) => {
  const response = await updateAll({ categories });
  return toSalesCategoryList(UpdateAllResponse.parse(response));
};

export const deleteSalesCategory = async (categoryId: number) => {
  await delete4(categoryId);
};
