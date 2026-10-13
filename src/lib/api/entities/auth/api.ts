import { customFetcher } from '@lib/api/customFetcher';
import { toLoginUser } from '@lib/api/entities/auth/toLoginUser';
import { Login1Response } from '@lib/api/generated/auth/auth.zod';
import type { LoginRequest } from '@lib/api/generated/bizSchedAPI.schemas';

const LOGIN_PATH = '/api/auth/login';

// NOTE: BFF는 BE 로그인 응답에서 토큰을 빼고 돌려주므로 생성 스키마의 user만 검증한다 (docs/architecture/auth.md "생성 함수와 BFF")
const LoginBffResponse = Login1Response.pick({ user: true });

const postLogin = async (loginRequest: LoginRequest) => {
  const response = await customFetcher<unknown>(LOGIN_PATH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginRequest),
  });

  return toLoginUser(LoginBffResponse.parse(response).user);
};

export { postLogin };
