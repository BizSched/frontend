import { clearAuthCookies } from '@lib/api/bff/authCookies';
import { withBffHandler } from '@lib/api/bff/withBffHandler';

export const DELETE = withBffHandler(async () => {
  await clearAuthCookies();

  return new Response(null, { status: 204 });
});
