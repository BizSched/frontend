import 'server-only';

import type { z } from 'zod';

import { LoginParams } from '@lib/api/generated/oauth/oauth.zod';

const OAuthProviderSchema = LoginParams.shape.provider;

type OAuthProvider = z.infer<typeof OAuthProviderSchema>;

// NOTE: provider는 임시 쿠키 Path에 그대로 들어가므로 타입 단언 대신 허용 목록으로 검증한다 (docs/architecture/auth.md "인가 요청")
const parseOAuthProvider = (value: unknown): OAuthProvider | null => {
  const result = OAuthProviderSchema.safeParse(value);

  return result.success ? result.data : null;
};

export { parseOAuthProvider };
export type { OAuthProvider };
