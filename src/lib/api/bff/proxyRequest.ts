import 'server-only';

import { NetworkError } from '@lib/api/apiError';
import { createPathNotAllowedResponse } from '@lib/api/bff/bffErrorResponse';
import { getAuthHeaders } from '@lib/api/getAuthHeaders';
import { getPartTimeStaffAttachmentType } from '@lib/utilities/partTime/partTimeStaffAttachment';

const UPSTREAM_TIMEOUT_MS = 10_000;
const REQUEST_HEADER_NAMES = ['content-type', 'accept', 'accept-language'];
const RESPONSE_HEADER_NAMES_TO_REMOVE = [
  'set-cookie',
  'connection',
  'keep-alive',
  'proxy-connection',
  'te',
  'transfer-encoding',
  'upgrade',
  'trailer',
  'proxy-authenticate',
  'proxy-authorization',
];

const isAllowedPath = (path: string[]) => {
  if (path.some((segment) => /[/\\]/.test(segment))) return false;

  const segments = path.map((segment) => segment.toLowerCase());
  return (
    segments[0] !== 'auth' &&
    segments[0] !== 'oauth' &&
    segments.join('/') !== 'users/signup/additional-info'
  );
};

const createRequestHeaders = async (request: Request) => {
  const headers = new Headers(await getAuthHeaders());
  for (const name of REQUEST_HEADER_NAMES) {
    const value = request.headers.get(name);
    if (value !== null) headers.set(name, value);
  }
  headers.set('accept-encoding', 'identity');
  return headers;
};

const createResponseHeaders = (response: Response) => {
  const headers = new Headers(response.headers);
  const connectionHeaders =
    response.headers.get('connection')?.split(',') ?? [];
  for (const name of [
    ...RESPONSE_HEADER_NAMES_TO_REMOVE,
    ...connectionHeaders,
  ]) {
    const trimmedName = name.trim();
    if (trimmedName) headers.delete(trimmedName);
  }

  const encoding = response.headers.get('content-encoding');
  if (encoding && encoding.toLowerCase() !== 'identity') {
    headers.delete('content-encoding');
    headers.delete('content-length');
  }
  return headers;
};

const proxyRequest = async (request: Request, path: string[]) => {
  if (!isAllowedPath(path)) return createPathNotAllowedResponse();

  const baseUrl = process.env.BE_BASE_URL;
  if (!baseUrl) throw new Error('BE_BASE_URL is not set');

  const url = `${baseUrl.replace(/\/+$/, '')}/api/${path.map(encodeURIComponent).join('/')}${new URL(request.url).search}`;
  const headers = await createRequestHeaders(request);
  const timeoutController = new AbortController();
  const signal = AbortSignal.any([request.signal, timeoutController.signal]);
  const timeout = setTimeout(
    () =>
      timeoutController.abort(
        new DOMException('Upstream timed out', 'TimeoutError'),
      ),
    UPSTREAM_TIMEOUT_MS,
  );

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: request.method,
      headers,
      cache: 'no-store',
      redirect: 'manual',
      signal,
      ...(request.method !== 'GET' && request.method !== 'HEAD' && request.body
        ? { body: request.body, duplex: 'half' as const }
        : {}),
    });
  } catch (error) {
    throw new NetworkError({ cause: error });
  } finally {
    clearTimeout(timeout);
  }

  const responseHeaders = createResponseHeaders(upstream);
  if (
    request.method === 'GET' &&
    upstream.ok &&
    /^staff\/\d+\/attachments\/\d+$/.test(path.join('/'))
  ) {
    const disposition = responseHeaders.get('content-disposition') ?? '';
    const parameterIndex = disposition.indexOf(';');
    const parameters =
      parameterIndex < 0 ? '' : disposition.slice(parameterIndex);
    const isPreviewable =
      getPartTimeStaffAttachmentType(
        responseHeaders.get('content-type') ?? '',
      ) !== undefined;
    responseHeaders.set(
      'content-disposition',
      `${isPreviewable ? 'inline' : 'attachment'}${parameters}`,
    );
    responseHeaders.set('x-content-type-options', 'nosniff');
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};

export { proxyRequest };
