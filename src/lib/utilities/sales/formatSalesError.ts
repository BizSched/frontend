import { P, match } from 'ts-pattern';

import { ApiError, NetworkError } from '@lib/api/apiError';

const SALES_ERROR_MESSAGE = '매출 내역을 불러오지 못했습니다.';

export const formatSalesError = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ errorCode, message }) =>
      match(errorCode)
        .with('UNKNOWN', () => SALES_ERROR_MESSAGE)
        .otherwise(() => message || SALES_ERROR_MESSAGE),
    )
    .with(P.instanceOf(NetworkError), () => SALES_ERROR_MESSAGE)
    .otherwise(() => SALES_ERROR_MESSAGE);
