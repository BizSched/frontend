// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { proxyRequest } from '@lib/api/bff/proxyRequest';
import type * as ProxyRequestModule from '@lib/api/bff/proxyRequest';

import {
  DELETE,
  GET,
  HEAD,
  OPTIONS,
  PATCH,
  POST,
  PUT,
} from '@app/api/[...path]/route';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/getAuthHeaders', () => ({
  getAuthHeaders: vi.fn(async () => ({})),
}));
vi.mock('@lib/api/bff/proxyRequest', async (importOriginal) => ({
  ...(await importOriginal<typeof ProxyRequestModule>()),
  proxyRequest: vi.fn(),
}));

const context = { params: Promise.resolve({ path: ['terms'] }) };

describe('/api/[...path]', () => {
  beforeEach(() => {
    vi.mocked(proxyRequest).mockReset();
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it.each([
    ['GET', GET],
    ['POST', POST],
    ['PUT', PUT],
    ['PATCH', PATCH],
    ['DELETE', DELETE],
  ])(
    '%s 요청과 비동기 params를 범용 통과 함수에 전달한다',
    async (method, handler) => {
      const request = new Request('https://bizsched.app/api/terms', {
        method,
        headers: { Origin: 'https://bizsched.app', Host: 'bizsched.app' },
      });
      const upstream = new Response('terms');
      vi.mocked(proxyRequest).mockResolvedValue(upstream);

      const response = await handler(request, context);

      expect(proxyRequest).toHaveBeenCalledWith(request, ['terms']);
      expect(response).toBe(upstream);
    },
  );

  it.each([
    ['POST', POST],
    ['PUT', PUT],
    ['PATCH', PATCH],
    ['DELETE', DELETE],
  ])(
    'Origin이 다른 %s 요청은 BE 호출 전에 403으로 거부한다',
    async (method, handler) => {
      const response = await handler(
        new Request('https://bizsched.app/api/terms', {
          method,
          headers: { Origin: 'https://evil.example', Host: 'bizsched.app' },
        }),
        context,
      );

      expect(proxyRequest).not.toHaveBeenCalled();
      expect(response.status).toBe(403);
    },
  );

  it.each([
    ['HEAD', HEAD],
    ['OPTIONS', OPTIONS],
  ])('%s는 405로 거부한다', async (_method, handler) => {
    const response = handler();

    expect(proxyRequest).not.toHaveBeenCalled();
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('GET, POST, PUT, PATCH, DELETE');
    expect(response.body).toBeNull();
  });

  it('실제 범용 통과 연결 실패를 502 응답으로 변환한다', async () => {
    const { proxyRequest: realProxyRequest } = await vi.importActual<
      typeof ProxyRequestModule
    >('@lib/api/bff/proxyRequest');
    vi.mocked(proxyRequest).mockImplementation(realProxyRequest);
    vi.stubEnv('BE_BASE_URL', 'https://backend.example');
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new TypeError('fetch failed')),
    );

    const response = await GET(
      new Request('https://bizsched.app/api/terms'),
      context,
    );

    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toEqual({
      code: 502,
      message: '',
      errorCode: 'BFF_UPSTREAM_UNAVAILABLE',
    });
  });

  it('실제 범용 통과 timeout을 504 응답으로 변환한다', async () => {
    vi.useFakeTimers();
    const { proxyRequest: realProxyRequest } = await vi.importActual<
      typeof ProxyRequestModule
    >('@lib/api/bff/proxyRequest');
    vi.mocked(proxyRequest).mockImplementation(realProxyRequest);
    vi.stubEnv('BE_BASE_URL', 'https://backend.example');
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, options: RequestInit) =>
          new Promise((_resolve, reject) => {
            options.signal!.addEventListener(
              'abort',
              () => reject(options.signal!.reason),
              { once: true },
            );
          }),
      ),
    );
    const pending = GET(new Request('https://bizsched.app/api/terms'), context);

    await vi.advanceTimersByTimeAsync(10_000);
    const response = await pending;

    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toEqual({
      code: 504,
      message: '',
      errorCode: 'BFF_UPSTREAM_TIMEOUT',
    });
  });
});
