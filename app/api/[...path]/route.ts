import { proxyRequest } from '@lib/api/bff/proxyRequest';
import { withBffHandler } from '@lib/api/bff/withBffHandler';

const handler = withBffHandler(
  async (request: Request, context: RouteContext<'/api/[...path]'>) => {
    const { path } = await context.params;
    return proxyRequest(request, path);
  },
);

const methodNotAllowed = () =>
  new Response(null, {
    status: 405,
    headers: { Allow: 'GET, POST, PUT, PATCH, DELETE' },
  });

export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as PATCH,
  handler as DELETE,
  methodNotAllowed as HEAD,
  methodNotAllowed as OPTIONS,
};
