import type {
  FindAll3Params,
  SaleCreateRequest,
  SaleUpdateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';
import {
  findAll3,
  create3,
  update,
  _delete,
} from '@lib/api/generated/sales/sales';

import { toSale, saleResponseSchema } from './toSale';
import { toSalesList, salesListResponseSchema } from './toSalesList';

export const getSalesList = async (params?: FindAll3Params) => {
  const response = await findAll3(params);
  const dto = salesListResponseSchema.parse(response);
  return toSalesList(dto);
};

export const createSale = async (body: SaleCreateRequest) => {
  const response = await create3(body);
  const dto = saleResponseSchema.parse(response);
  return toSale(dto);
};

export const updateSale = async (salesId: number, body: SaleUpdateRequest) => {
  const response = await update(salesId, body);
  const dto = saleResponseSchema.parse(response);
  return toSale(dto);
};

export const deleteSale = async (salesId: number) => {
  await _delete(salesId);
};
