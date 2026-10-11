import type {
  FindAll3Params,
  FindSummaryParams,
  SaleCreateRequest,
  SaleUpdateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';
import { FindSummaryResponse as salesSummaryResponseSchema } from '@lib/api/generated/index.zod';
import {
  findAll3,
  create3,
  update,
  _delete,
} from '@lib/api/generated/sales/sales';
import { findSummary } from '@lib/api/generated/sales-analytics/sales-analytics';

import { toSale, saleResponseSchema } from './toSale';
import { toSalesList, salesListResponseSchema } from './toSalesList';

export const getSalesList = async (
  params?: FindAll3Params,
  options?: RequestInit,
) => {
  const response = await findAll3(params, options);
  const dto = salesListResponseSchema.parse(response);
  return toSalesList(dto);
};

export const getSalesMonthTotal = async (
  params?: FindSummaryParams,
  options?: RequestInit,
) => {
  const response = await findSummary(params, options);
  const dto = salesSummaryResponseSchema.parse(response);
  return dto.totalAmount;
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
