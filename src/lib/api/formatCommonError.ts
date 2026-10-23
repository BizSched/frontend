import { match, P } from 'ts-pattern';

import { ApiError } from '@lib/api/apiError';

const COMMON_ERROR_MESSAGE =
  '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.';

// NOTE: BE message가 없으면 ApiError가 errorCode를 message로 쓰므로, 그 값은 화면 문구로 쓰지 않는다
const formatCommonError = (error: unknown) =>
  match(error)
    .with(
      P.instanceOf(ApiError),
      ({ message, errorCode }) => message && message !== errorCode,
      ({ message }) => message,
    )
    .otherwise(() => COMMON_ERROR_MESSAGE);

export { COMMON_ERROR_MESSAGE, formatCommonError };
