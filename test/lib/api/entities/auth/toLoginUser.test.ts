import { describe, expect, it } from 'vitest';

import { toLoginUser } from '@lib/api/entities/auth/toLoginUser';

describe('toLoginUser', () => {
  it('로그인 사용자 DTO를 id·email·name만 가진 DAO로 바꾼다', () => {
    const dto = { id: 1, email: 'owner@bizsched.app', name: '사장님' };

    expect(toLoginUser(dto)).toEqual(dto);
  });
});
