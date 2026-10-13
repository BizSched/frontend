import { findAll4 } from '@lib/api/generated/terms/terms';
import { FindAll4Response } from '@lib/api/generated/terms/terms.zod';

const getTerms = async (options?: RequestInit) => {
  const response = await findAll4(options);
  return FindAll4Response.parse(response).items;
};

export { getTerms };
