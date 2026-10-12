import type { LoginUser as LoginUserDto } from '@lib/api/generated/bizSchedAPI.schemas';
import type { LoginUser } from '@lib/types/auth';

const toLoginUser = ({ id, email, name }: LoginUserDto): LoginUser => ({
  id,
  email,
  name,
});

export { toLoginUser };
