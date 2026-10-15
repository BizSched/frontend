// @vitest-environment node
import { createServer } from 'node:http';
import type { IncomingHttpHeaders } from 'node:http';
import { gzipSync } from 'node:zlib';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { NetworkError } from '@lib/api/apiError';
import { proxyRequest } from '@lib/api/bff/proxyRequest';
import { getAuthHeaders } from '@lib/api/getAuthHeaders';

vi.mock('server-only', () => ({}));
vi.mock('@lib/api/getAuthHeaders', () => ({ getAuthHeaders: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();
const realFetch = globalThis.fetch;
const createRequest = (method = 'GET', options: RequestInit = {}) =>
  new Request('https://bizsched.app/api/terms?type=SIGNUP&tag=a%2Fb&tag=c', {
    method,
    ...options,
  });

describe('proxyRequest', () => {
  beforeEach(() => {
    vi.stubEnv('BE_BASE_URL', 'https://backend.example/');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
    fetchMock.mockResolvedValue(new Response('upstream'));
    vi.mocked(getAuthHeaders).mockReset();
    vi.mocked(getAuthHeaders).mockResolvedValue({
      Authorization: 'Bearer access',
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it.each([
    ['auth'],
    ['auth', 'login'],
    ['AuTh', 'refresh'],
    ['oauth', 'google'],
    ['OAUTH'],
    ['users', 'signup', 'additional-info'],
    ['USERS', 'SIGNUP', 'ADDITIONAL-INFO'],
    ['auth/login'],
    ['auth\\login'],
    ['staff', 'a/b'],
    ['staff', 'a\\b'],
  ])('토큰 경로나 경로 구분자가 포함된 %j를 차단한다', async (...path) => {
    const response = await proxyRequest(createRequest(), path);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(getAuthHeaders).not.toHaveBeenCalled();
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      code: 404,
      message: '',
      errorCode: 'BFF_PATH_NOT_ALLOWED',
    });
  });

  it.each([
    ['terms'],
    ['users', 'signup'],
    ['users', 'signup', 'additional-info-extra'],
    ['users', 'signup', 'additional-info', 'details'],
  ])('허용된 %j 경로를 전달한다', async (...path) => {
    await proxyRequest(createRequest(), path);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('디코딩된 세그먼트를 다시 인코딩하고 쿼리를 유지한다', async () => {
    await proxyRequest(createRequest(), ['staff', 'a?b#c', '%2F', '한글']);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://backend.example/api/staff/a%3Fb%23c/%252F/%ED%95%9C%EA%B8%80?type=SIGNUP&tag=a%2Fb&tag=c',
      expect.objectContaining({ cache: 'no-store', redirect: 'manual' }),
    );
  });

  it('요청 헤더는 허용 목록과 쿠키에서 만든 Authorization만 전달한다', async () => {
    const request = createRequest('POST', {
      body: '{"name":"owner"}',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Accept-Language': 'ko',
        Authorization: 'Bearer attacker',
        Cookie: 'refreshToken=secret',
        Host: 'bizsched.app',
        Origin: 'https://bizsched.app',
        'Content-Length': '16',
        'X-Forwarded-Host': 'attacker.example',
        'X-Custom': 'secret',
      },
    });

    await proxyRequest(request, ['users', 'signup']);

    const options = fetchMock.mock.calls[0][1]!;
    expect(Object.fromEntries(new Headers(options.headers))).toEqual({
      'content-type': 'application/json',
      accept: 'application/json',
      'accept-language': 'ko',
      authorization: 'Bearer access',
      'accept-encoding': 'identity',
    });
    expect(options.body).toBe(request.body);
    expect(options).toMatchObject({ method: 'POST', duplex: 'half' });
    await expect(new Response(options.body).text()).resolves.toBe(
      '{"name":"owner"}',
    );
  });

  it('access 쿠키가 없으면 Authorization 없이 전달하고 GET에는 body가 없다', async () => {
    vi.mocked(getAuthHeaders).mockResolvedValue({});

    await proxyRequest(createRequest(), ['terms']);

    const options = fetchMock.mock.calls[0][1]!;
    expect(new Headers(options.headers).has('authorization')).toBe(false);
    expect(options.body).toBeUndefined();
    expect(options).not.toHaveProperty('duplex');
  });

  it('응답 스트림은 읽지 않고 전달하며 위험 헤더만 제거한다', async () => {
    const body = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('file'));
      },
    });
    const upstream = new Response(body, {
      headers: {
        'Set-Cookie': 'accessToken=attacker',
        Connection: 'X-Secret, KEEP-ALIVE',
        'X-Secret': 'secret',
        'Keep-Alive': 'timeout=5',
        'Proxy-Connection': 'close',
        TE: 'trailers',
        'Transfer-Encoding': 'chunked',
        Upgrade: 'websocket',
        Trailer: 'digest',
        'Proxy-Authenticate': 'Basic',
        'Proxy-Authorization': 'secret',
        'Content-Length': '4',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="test.bin"',
        ETag: 'abc',
      },
    });
    fetchMock.mockResolvedValue(upstream);

    const response = await proxyRequest(createRequest(), [
      'staff',
      '1',
      'attachments',
      '2',
    ]);

    expect(response.body).toBe(body);
    expect(body.locked).toBe(false);
    expect(Object.fromEntries(response.headers)).toEqual({
      'content-length': '4',
      'content-type': 'application/octet-stream',
      'content-disposition': 'attachment; filename="test.bin"',
      'x-content-type-options': 'nosniff',
      etag: 'abc',
    });
    await response.body!.cancel();
  });

  it.each(['gzip', 'br', 'deflate'])(
    '%s 압축 응답은 encoding과 length를 제거한다',
    async (encoding) => {
      fetchMock.mockResolvedValue(
        new Response('decoded', {
          headers: {
            'Content-Encoding': encoding,
            'Content-Length': '3',
          },
        }),
      );

      const response = await proxyRequest(createRequest(), ['terms']);

      expect(response.headers.has('content-encoding')).toBe(false);
      expect(response.headers.has('content-length')).toBe(false);
      await expect(response.text()).resolves.toBe('decoded');
    },
  );

  it.each([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'Application/PDF; charset=binary',
  ])(
    '허용 MIME %s는 파일명을 유지하고 inline과 nosniff로 전달한다',
    async (contentType) => {
      const filename =
        '; filename="contract.pdf"; filename*=UTF-8\'\'%EA%B3%84%EC%95%BD%EC%84%9C.pdf';
      fetchMock.mockResolvedValue(
        new Response('%PDF-1.7', {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment${filename}`,
          },
        }),
      );
      const response = await proxyRequest(createRequest(), [
        'staff',
        '42',
        'attachments',
        '3',
      ]);
      expect(response.headers.get('content-disposition')).toBe(
        `inline${filename}`,
      );
      expect(response.headers.get('content-type')).toBe(contentType);
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
      await expect(response.text()).resolves.toBe('%PDF-1.7');
    },
  );

  it.each([
    'text/html',
    'image/svg+xml',
    'application/xhtml+xml',
    'application/octet-stream',
    '',
  ])(
    '위험하거나 알 수 없는 MIME %s는 inline 대신 attachment로 강제한다',
    async (contentType) => {
      fetchMock.mockResolvedValue(
        new Response('<script>alert(1)</script>', {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': 'inline; filename="unsafe.svg"',
          },
        }),
      );
      const response = await proxyRequest(createRequest(), [
        'staff',
        '42',
        'attachments',
        '3',
      ]);
      expect(response.headers.get('content-disposition')).toBe(
        'attachment; filename="unsafe.svg"',
      );
      expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    },
  );

  it('disposition이 없는 HTML 응답에도 다운로드 헤더를 붙인다', async () => {
    fetchMock.mockResolvedValue(
      new Response('<script>alert(1)</script>', {
        headers: { 'Content-Type': 'text/html' },
      }),
    );
    const response = await proxyRequest(createRequest(), [
      'staff',
      '42',
      'attachments',
      '3',
    ]);
    expect(response.headers.get('content-disposition')).toBe('attachment');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });

  it.each([
    { method: 'GET', status: 404, path: ['staff', '42', 'attachments', '3'] },
    { method: 'POST', status: 200, path: ['staff', '42', 'attachments', '3'] },
    { method: 'GET', status: 200, path: ['tasks', '42', 'attachments', '3'] },
    {
      method: 'GET',
      status: 200,
      path: ['staff', '42', 'attachments', '3', 'extra'],
    },
  ])(
    '파일 조회 외 응답의 disposition을 유지한다: %j',
    async ({ method, status, path }) => {
      fetchMock.mockResolvedValue(
        new Response('file', {
          status,
          headers: { 'Content-Disposition': 'attachment; filename="test.pdf"' },
        }),
      );
      const response = await proxyRequest(createRequest(method), path);
      expect(response.headers.get('content-disposition')).toBe(
        'attachment; filename="test.pdf"',
      );
    },
  );

  it.each([201, 302, 400, 401, 404, 500, 503])(
    'BE의 %s status와 본문을 그대로 전달한다',
    async (status) => {
      const upstream = new Response('raw upstream body', {
        status,
        headers: { Location: '/api/auth/login' },
      });
      fetchMock.mockResolvedValue(upstream);

      const response = await proxyRequest(createRequest(), ['terms']);

      expect(response.status).toBe(status);
      expect(response.headers.get('location')).toBe('/api/auth/login');
      await expect(response.text()).resolves.toBe('raw upstream body');
    },
  );

  it('204 빈 응답도 전달한다', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    const response = await proxyRequest(createRequest('DELETE'), [
      'tasks',
      '1',
    ]);

    expect(response.status).toBe(204);
    expect(response.body).toBeNull();
  });

  it('10초 동안 헤더를 받지 못하면 timeout NetworkError를 던진다', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation(
      (_url, options) =>
        new Promise((_resolve, reject) => {
          options!.signal!.addEventListener(
            'abort',
            () => reject(options!.signal!.reason),
            { once: true },
          );
        }),
    );
    const pending = proxyRequest(createRequest(), ['terms']).catch(
      (error: unknown) => error,
    );

    await vi.advanceTimersByTimeAsync(10_000);

    expect(await pending).toMatchObject({
      name: 'NetworkError',
      cause: { name: 'TimeoutError' },
    });
    expect(vi.getTimerCount()).toBe(0);
  });

  it('헤더를 받은 뒤 timeout을 해제하고 요청 취소는 계속 전달한다', async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const response = await proxyRequest(
      createRequest('GET', { signal: controller.signal }),
      ['terms'],
    );
    const signal = fetchMock.mock.calls[0][1]!.signal!;

    await vi.advanceTimersByTimeAsync(20_000);

    expect(signal.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
    controller.abort();
    expect(signal.aborted).toBe(true);
    await response.body!.cancel();
  });

  it('연결 실패는 NetworkError로 변환하고 timeout을 해제한다', async () => {
    vi.useFakeTimers();
    const cause = new TypeError('fetch failed');
    fetchMock.mockRejectedValue(cause);

    await expect(proxyRequest(createRequest(), ['terms'])).rejects.toEqual(
      new NetworkError({ cause }),
    );
    expect(vi.getTimerCount()).toBe(0);
  });

  it('실제 Node fetch로 chunked 업로드와 압축 해제된 응답을 전달한다', async () => {
    const received =
      vi.fn<(headers: IncomingHttpHeaders, body: string) => void>();
    const server = createServer(async (request, response) => {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      received(request.headers, Buffer.concat(chunks).toString());
      const compressed = gzipSync('decoded upstream');
      response.writeHead(201, {
        'Content-Encoding': 'gzip',
        'Content-Length': compressed.length,
        'Set-Cookie': 'accessToken=attacker',
        'Content-Type': 'text/plain',
      });
      response.end(compressed);
    });
    await new Promise<void>((resolve) =>
      server.listen(0, '127.0.0.1', resolve),
    );
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('expected server address');
    vi.stubEnv('BE_BASE_URL', `http://127.0.0.1:${address.port}`);
    vi.stubGlobal('fetch', realFetch);

    try {
      const response = await proxyRequest(
        createRequest('POST', {
          body: 'streamed request',
          headers: { Cookie: 'secret=token' },
        }),
        ['users', 'signup'],
      );

      expect(response.status).toBe(201);
      expect(response.headers.has('set-cookie')).toBe(false);
      expect(response.headers.has('content-encoding')).toBe(false);
      expect(response.headers.has('content-length')).toBe(false);
      await expect(response.text()).resolves.toBe('decoded upstream');
      const [headers, body] = received.mock.calls[0];
      expect(body).toBe('streamed request');
      expect(headers).toMatchObject({
        authorization: 'Bearer access',
        'accept-encoding': 'identity',
        'transfer-encoding': 'chunked',
      });
      expect(headers).not.toHaveProperty('cookie');
      expect(headers).not.toHaveProperty('content-length');
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
  });
});
