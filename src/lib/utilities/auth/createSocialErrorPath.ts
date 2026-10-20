import * as zod from 'zod';

import { SocialEmailConflictJoinType } from '@lib/api/generated/bizSchedAPI.schemas';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';

const SOCIAL_EMAIL_CONFLICT_CODE = 'SOCIAL_EMAIL_CONFLICT';

const SocialEmailConflictData = zod.object({
  joinType: zod.enum(SocialEmailConflictJoinType),
});

const createSocialErrorPath = (errorCode: string, data?: unknown) => {
  const params = new URLSearchParams({ socialError: errorCode });
  const conflict = SocialEmailConflictData.safeParse(data);
  if (errorCode === SOCIAL_EMAIL_CONFLICT_CODE && conflict.success) {
    params.set('joinType', conflict.data.joinType);
  }

  return `${ROUTE_PATHS.login()}?${params}`;
};

export { createSocialErrorPath };
