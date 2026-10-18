import { toLoginUser } from '@lib/api/entities/auth/toLoginUser';
import { findMe } from '@lib/api/generated/users/users';
import { FindMeResponse } from '@lib/api/generated/users/users.zod';

const getMe = async (options?: RequestInit) =>
  toLoginUser(FindMeResponse.parse(await findMe(options)));

export { getMe };
