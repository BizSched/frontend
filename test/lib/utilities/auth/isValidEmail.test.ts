import { describe, expect, it } from 'vitest';

import { isValidEmail } from '@lib/utilities/auth/isValidEmail';

describe('isValidEmail', () => {
  it.each(['owner@example.com', 'Owner+shop@sub.example.com'])(
    '이메일 형식 %s를 허용한다',
    (email) => {
      expect(isValidEmail(email)).toBe(true);
    },
  );

  it.each([
    '',
    'owner',
    'owner@example',
    'owner@@example.com',
    'owner @example.com',
    ' owner@example.com',
    'owner@example.com\n',
  ])('잘못된 형식 %s를 거부한다', (email) => {
    expect(isValidEmail(email)).toBe(false);
  });
});
