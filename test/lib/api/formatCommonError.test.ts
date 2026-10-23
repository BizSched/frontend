import { describe, expect, it } from 'vitest';

import { ApiError, NetworkError } from '@lib/api/apiError';
import {
  COMMON_ERROR_MESSAGE,
  formatCommonError,
} from '@lib/api/formatCommonError';

describe('formatCommonError', () => {
  it('BE message가 있으면 그대로 보여준다', () => {
    const error = new ApiError(
      'STAFF_NOT_FOUND',
      404,
      '아르바이트생이 없습니다.',
    );

    expect(formatCommonError(error)).toBe('아르바이트생이 없습니다.');
  });

  it.each([
    ['message가 빈 BFF 에러', new ApiError('BFF_INVALID_ORIGIN', 403, '')],
    ['message가 없던 ApiError', new ApiError('UNKNOWN', 400)],
    ['NetworkError', new NetworkError()],
    ['5xx 일반 Error', new Error('HTTP 500')],
    ['에러가 아닌 값', 'oops'],
  ])('%s는 공통 문구를 보여준다', (_, error) => {
    expect(formatCommonError(error)).toBe(COMMON_ERROR_MESSAGE);
  });
});
