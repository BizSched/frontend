import 'server-only';

import {
  createInvalidOriginResponse,
  toBffErrorResponse,
} from '@lib/api/bff/bffErrorResponse';
import { isValidOrigin } from '@lib/api/bff/isValidOrigin';

type BffRouteHandler<Context> = (
  request: Request,
  context: Context,
) => Promise<Response>;

const withBffHandler =
  <Context>(handler: BffRouteHandler<Context>): BffRouteHandler<Context> =>
  async (request, context) => {
    if (!isValidOrigin(request)) return createInvalidOriginResponse();

    try {
      return await handler(request, context);
    } catch (error) {
      return toBffErrorResponse(error);
    }
  };

export { withBffHandler };
