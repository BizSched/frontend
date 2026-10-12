import { clearAuthCookies } from '@lib/api/bff/authCookies';
import { withBffHandler } from '@lib/api/bff/withBffHandler';
import { logout } from '@lib/api/generated/auth/auth';
import { getAuthHeaders } from '@lib/api/getAuthHeaders';

export const POST = withBffHandler(async () => {
  await logout({ headers: await getAuthHeaders() });
  await clearAuthCookies();

  return new Response(null, { status: 204 });
});
