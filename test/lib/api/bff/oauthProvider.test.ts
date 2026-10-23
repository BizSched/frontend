// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';

import { parseOAuthProvider } from '@lib/api/bff/oauthProvider';

vi.mock('server-only', () => ({}));

describe('parseOAuthProvider', () => {
  it.each(['kakao', 'google'] as const)(
    '허용된 %s는 그대로 돌려준다',
    (value) => {
      expect(parseOAuthProvider(value)).toBe(value);
    },
  );

  it.each(['naver', 'Kakao', '', '../api', undefined, ['kakao']])(
    '허용 목록에 없는 %j는 null이다',
    (value) => {
      expect(parseOAuthProvider(value)).toBeNull();
    },
  );
});
