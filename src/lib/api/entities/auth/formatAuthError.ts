import { match, P } from 'ts-pattern';

import { ApiError } from '@lib/api/apiError';
import { formatCommonError } from '@lib/api/formatCommonError';

const INVALID_CREDENTIALS_MESSAGE =
  '이메일 또는 비밀번호가 일치하지 않습니다. 카카오·구글로 가입하셨다면 소셜 로그인을 이용해 주세요.';

const formatAuthError = (error: unknown) =>
  match(error)
    .with(P.instanceOf(ApiError), ({ errorCode }) =>
      match(errorCode)
        .with('INVALID_CREDENTIALS', () => INVALID_CREDENTIALS_MESSAGE)
        .otherwise(() => formatCommonError(error)),
    )
    .otherwise(() => formatCommonError(error));

export { formatAuthError, INVALID_CREDENTIALS_MESSAGE };
