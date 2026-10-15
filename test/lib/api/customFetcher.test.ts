// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { customFetcher } from '@lib/api/customFetcher';

const BE_BASE_URL = 'https://be.example.com';

const mockFetch = (response: Response) => {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

describe('customFetcher', () => {
  beforeEach(() => {
    vi.stubEnv('BE_BASE_URL', BE_BASE_URL);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  describe('요청 URL', () => {
    it('서버에서는 BE_BASE_URL을 앞에 붙인다', async () => {
      const fetchMock = mockFetch(jsonResponse({ ok: true }, 200));

      await customFetcher('/api/auth/login');

      expect(fetchMock).toHaveBeenCalledWith(
        `${BE_BASE_URL}/api/auth/login`,
        expect.any(Object),
      );
    });

    it('브라우저에서는 상대 경로를 그대로 쓴다', async () => {
      vi.stubGlobal('window', {});
      const fetchMock = mockFetch(jsonResponse({ ok: true }, 200));

      await customFetcher('/api/auth/login');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/login',
        expect.any(Object),
      );
    });

    it('서버에서 BE_BASE_URL이 없으면 요청하지 않고 실패한다', async () => {
      vi.stubEnv('BE_BASE_URL', '');
      const fetchMock = mockFetch(jsonResponse({}, 200));

      await expect(customFetcher('/api/auth/login')).rejects.toThrow(
        'BE_BASE_URL is not set',
      );
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('호출부가 넘긴 헤더를 그대로 전달한다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));
      const headers = { Authorization: 'Bearer token' };

      await customFetcher('/api/users/me', { headers });

      expect(fetchMock.mock.calls[0][1]).toMatchObject({ headers });
    });

    it('BE_BASE_URL이 /로 끝나도 슬래시를 하나만 넣는다', async () => {
      vi.stubEnv('BE_BASE_URL', `${BE_BASE_URL}/`);
      const fetchMock = mockFetch(jsonResponse({}, 200));

      await customFetcher('/api/auth/login');

      expect(fetchMock).toHaveBeenCalledWith(
        `${BE_BASE_URL}/api/auth/login`,
        expect.any(Object),
      );
    });
  });

  describe('캐시 옵션', () => {
    it('캐시 옵션이 없으면 cache: no-store를 기본으로 넣는다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));

      await customFetcher('/api/staff');

      expect(fetchMock.mock.calls[0][1]).toMatchObject({ cache: 'no-store' });
    });

    it('next.revalidate를 넘기면 cache: no-store를 넣지 않는다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));

      await customFetcher('/api/terms', { next: { revalidate: 3600 } });

      const init = fetchMock.mock.calls[0][1] as RequestInit;
      expect(init.cache).toBeUndefined();
      expect(init.next).toEqual({ revalidate: 3600 });
    });

    it('호출부가 넘긴 cache 값을 그대로 쓴다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));

      await customFetcher('/api/terms', { cache: 'force-cache' });

      expect(fetchMock.mock.calls[0][1]).toMatchObject({
        cache: 'force-cache',
      });
    });
  });

  describe('성공 응답', () => {
    it('Blob 응답은 MIME 타입과 바이너리 바이트를 유지하고 응답 옵션을 HTTP 요청에 넣지 않는다', async () => {
      const bytes = new Uint8Array([0, 255, 128, 37, 80, 68, 70]);
      const fetchMock = mockFetch(
        new Response(bytes, {
          headers: { 'Content-Type': 'application/pdf' },
        }),
      );

      const blob = await customFetcher<Blob>('/api/staff/42/attachments/3', {
        responseType: 'blob',
      });

      expect(blob.type).toBe('application/pdf');
      expect(new Uint8Array(await blob.arrayBuffer())).toEqual(bytes);
      expect(fetchMock.mock.calls[0][1]).not.toHaveProperty('responseType');
    });

    it('JSON body를 그대로 반환한다', async () => {
      mockFetch(jsonResponse({ user: { id: 1 } }, 200));

      await expect(customFetcher('/api/auth/login')).resolves.toEqual({
        user: { id: 1 },
      });
    });

    it('204 응답은 undefined를 반환한다', async () => {
      mockFetch(new Response(null, { status: 204 }));

      await expect(customFetcher('/api/auth/session')).resolves.toBeUndefined();
    });

    it('200 빈 body는 undefined를 반환한다', async () => {
      mockFetch(new Response('', { status: 200 }));

      await expect(customFetcher('/api/auth/logout')).resolves.toBeUndefined();
    });
  });

  describe('실패 응답', () => {
    it('4xx JSON body는 ApiError(errorCode, status, message)로 변환한다', async () => {
      mockFetch(
        jsonResponse(
          {
            code: 401,
            message: '이메일 또는 비밀번호가 일치하지 않습니다.',
            errorCode: 'INVALID_CREDENTIALS',
          },
          401,
        ),
      );

      const error = await customFetcher('/api/auth/login').catch((e) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({
        errorCode: 'INVALID_CREDENTIALS',
        status: 401,
        message: '이메일 또는 비밀번호가 일치하지 않습니다.',
      });
    });

    it('4xx body가 JSON이 아니면 errorCode를 UNKNOWN으로 둔다', async () => {
      mockFetch(new Response('<html>Bad Request</html>', { status: 400 }));

      const error = await customFetcher('/api/staff').catch((e) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect(error).toMatchObject({ errorCode: 'UNKNOWN', status: 400 });
    });

    it('5xx는 ApiError로 변환하지 않는다', async () => {
      mockFetch(
        jsonResponse({ code: 502, errorCode: 'BFF_UPSTREAM_UNAVAILABLE' }, 502),
      );

      const error = await customFetcher('/api/staff').catch((e) => e);

      expect(error).toBeInstanceOf(Error);
      expect(error).not.toBeInstanceOf(ApiError);
      expect(error).toHaveProperty('message', 'HTTP 502');
    });
  });

  describe('요청 실패', () => {
    it('네트워크 오류는 NetworkError로 변환한다', async () => {
      const cause = new TypeError('fetch failed');
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(cause));

      const error = await customFetcher('/api/staff').catch((e) => e);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error).toHaveProperty('cause', cause);
    });

    it('호출부가 취소하면 NetworkError로 바꾸지 않는다', async () => {
      const controller = new AbortController();
      const abortError = new DOMException('Aborted', 'AbortError');
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(() => {
          controller.abort();
          return Promise.reject(abortError);
        }),
      );

      const error = await customFetcher('/api/staff', {
        signal: controller.signal,
      }).catch((e) => e);

      expect(error).toBe(abortError);
    });

    it('timeout signal과 호출부 signal을 합쳐서 전달한다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));
      const controller = new AbortController();

      await customFetcher('/api/staff', { signal: controller.signal });

      const { signal } = fetchMock.mock.calls[0][1] as RequestInit;
      expect(signal).not.toBe(controller.signal);
      controller.abort();
      expect(signal?.aborted).toBe(true);
    });

    it('timeout이 지나면 NetworkError로 변환한다', async () => {
      const timeoutController = new AbortController();
      const timeoutSpy = vi
        .spyOn(AbortSignal, 'timeout')
        .mockReturnValue(timeoutController.signal);
      vi.stubGlobal(
        'fetch',
        vi.fn().mockImplementation(
          (_url: string, init: RequestInit) =>
            new Promise((_resolve, reject) => {
              init.signal?.addEventListener('abort', () =>
                reject(init.signal?.reason),
              );
            }),
        ),
      );

      const request = customFetcher('/api/staff').catch((e) => e);
      timeoutController.abort(new DOMException('timeout', 'TimeoutError'));
      const error = await request;
      timeoutSpy.mockRestore();

      expect(error).toBeInstanceOf(NetworkError);
    });

    it('서버 요청 timeout은 10초, 브라우저 요청 timeout은 15초다', async () => {
      const timeoutSpy = vi.spyOn(AbortSignal, 'timeout');
      mockFetch(jsonResponse({}, 200));
      await customFetcher('/api/staff');

      vi.stubGlobal('window', {});
      mockFetch(jsonResponse({}, 200));
      await customFetcher('/api/staff');

      expect(timeoutSpy.mock.calls).toEqual([[10_000], [15_000]]);
      timeoutSpy.mockRestore();
    });

    it('body를 읽다가 연결이 끊기면 NetworkError로 변환한다', async () => {
      const cause = new TypeError('terminated');
      mockFetch({
        ok: true,
        status: 200,
        text: () => Promise.reject(cause),
      } as unknown as Response);

      const error = await customFetcher('/api/staff').catch((e) => e);

      expect(error).toBeInstanceOf(NetworkError);
      expect(error).toHaveProperty('cause', cause);
    });
  });

  describe('AbortSignal.any가 없는 브라우저', () => {
    const originalAny = AbortSignal.any;

    beforeEach(() => {
      Object.defineProperty(AbortSignal, 'any', {
        value: undefined,
        configurable: true,
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(AbortSignal, 'any', {
        value: originalAny,
        configurable: true,
        writable: true,
      });
    });

    it('호출부가 취소하면 요청 signal도 취소된다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));
      const controller = new AbortController();

      await customFetcher('/api/staff', { signal: controller.signal });

      const { signal } = fetchMock.mock.calls[0][1] as RequestInit;
      expect(signal?.aborted).toBe(false);
      controller.abort();
      expect(signal?.aborted).toBe(true);
    });

    it('timeout이 지나면 요청 signal도 취소된다', async () => {
      const timeoutController = new AbortController();
      const timeoutSpy = vi
        .spyOn(AbortSignal, 'timeout')
        .mockReturnValue(timeoutController.signal);
      const fetchMock = mockFetch(jsonResponse({}, 200));

      await customFetcher('/api/staff', {
        signal: new AbortController().signal,
      });

      const { signal } = fetchMock.mock.calls[0][1] as RequestInit;
      timeoutController.abort();
      timeoutSpy.mockRestore();
      expect(signal?.aborted).toBe(true);
    });

    it('이미 취소된 signal을 넘기면 요청 signal도 취소된 상태다', async () => {
      const fetchMock = mockFetch(jsonResponse({}, 200));
      const controller = new AbortController();
      controller.abort();

      await customFetcher('/api/staff', { signal: controller.signal });

      const { signal } = fetchMock.mock.calls[0][1] as RequestInit;
      expect(signal?.aborted).toBe(true);
    });
  });
});

describe('customFetcher 브라우저 401 refresh', () => {
  type Handler = () => Response | Promise<Response>;

  const assign = vi.fn();

  const emptyResponse = () => new Response(null, { status: 204 });
  const errorResponse = (errorCode: string, status = 401) =>
    jsonResponse({ code: status, message: '', errorCode }, status);

  const mockRoutes = (routes: Record<string, Handler[]>) => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const key = `${init?.method ?? 'GET'} ${url}`;
      const handler = routes[key]?.shift();
      if (!handler) throw new Error(`예상하지 못한 요청: ${key}`);
      return handler();
    });
    vi.stubGlobal('fetch', fetchMock);
    return fetchMock;
  };

  const calledKeys = (fetchMock: ReturnType<typeof mockRoutes>) =>
    fetchMock.mock.calls.map(
      ([url, init]) => `${init?.method ?? 'GET'} ${url}`,
    );

  let fetcher: typeof customFetcher;

  beforeEach(async () => {
    vi.resetModules();
    ({ customFetcher: fetcher } = await import('@lib/api/customFetcher'));
    assign.mockReset();
    vi.stubGlobal('window', { location: { assign } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('TOKEN_EXPIRED면 refresh 후 원래 요청을 1회 재시도한다', async () => {
    const fetchMock = mockRoutes({
      'GET /api/staff': [
        () => errorResponse('TOKEN_EXPIRED'),
        () => jsonResponse({ ok: true }, 200),
      ],
      'POST /api/auth/refresh': [emptyResponse],
    });

    await expect(fetcher('/api/staff')).resolves.toEqual({ ok: true });
    expect(calledKeys(fetchMock)).toEqual([
      'GET /api/staff',
      'POST /api/auth/refresh',
      'GET /api/staff',
    ]);
  });

  it('첨부파일의 TOKEN_EXPIRED도 refresh 후 Blob으로 다시 받는다', async () => {
    const fetchMock = mockRoutes({
      'GET /api/staff/42/attachments/3': [
        () => errorResponse('TOKEN_EXPIRED'),
        () =>
          new Response('%PDF-1.7', {
            headers: { 'Content-Type': 'application/pdf' },
          }),
      ],
      'POST /api/auth/refresh': [emptyResponse],
    });

    const blob = await fetcher<Blob>('/api/staff/42/attachments/3', {
      responseType: 'blob',
    });
    expect(blob.type).toBe('application/pdf');
    expect(await blob.text()).toBe('%PDF-1.7');
    expect(calledKeys(fetchMock)).toEqual([
      'GET /api/staff/42/attachments/3',
      'POST /api/auth/refresh',
      'GET /api/staff/42/attachments/3',
    ]);
  });

  it('첨부파일 재요청도 401이면 세션을 정리하고 로그인으로 이동한다', async () => {
    const fetchMock = mockRoutes({
      'GET /api/staff/42/attachments/3': [
        () => errorResponse('TOKEN_EXPIRED'),
        () => errorResponse('TOKEN_EXPIRED'),
      ],
      'POST /api/auth/refresh': [emptyResponse],
      'DELETE /api/auth/session': [emptyResponse],
    });
    await expect(
      fetcher('/api/staff/42/attachments/3', { responseType: 'blob' }),
    ).rejects.toMatchObject({ status: 401 });
    expect(calledKeys(fetchMock)).toEqual([
      'GET /api/staff/42/attachments/3',
      'POST /api/auth/refresh',
      'GET /api/staff/42/attachments/3',
      'DELETE /api/auth/session',
    ]);
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('refresh가 실패해도 다른 탭이 먼저 refresh했을 수 있으므로 원래 요청을 1회 재시도한다', async () => {
    const fetchMock = mockRoutes({
      'GET /api/staff': [
        () => errorResponse('TOKEN_EXPIRED'),
        () => jsonResponse({ ok: true }, 200),
      ],
      'POST /api/auth/refresh': [() => errorResponse('INVALID_REFRESH_TOKEN')],
    });

    await expect(fetcher('/api/staff')).resolves.toEqual({ ok: true });
    expect(calledKeys(fetchMock)).not.toContain('DELETE /api/auth/session');
    expect(assign).not.toHaveBeenCalled();
  });

  it('재시도도 401이면 세션을 정리하고 로그인 페이지로 이동한 뒤 에러를 던진다', async () => {
    const fetchMock = mockRoutes({
      'GET /api/staff': [
        () => errorResponse('TOKEN_EXPIRED'),
        () => errorResponse('TOKEN_EXPIRED'),
      ],
      'POST /api/auth/refresh': [() => errorResponse('INVALID_REFRESH_TOKEN')],
      'DELETE /api/auth/session': [emptyResponse],
    });

    await expect(fetcher('/api/staff')).rejects.toMatchObject({
      status: 401,
      errorCode: 'TOKEN_EXPIRED',
    });
    expect(calledKeys(fetchMock)).toContain('DELETE /api/auth/session');
    expect(assign).toHaveBeenCalledWith('/login');
  });

  it('rotation에 유예가 없으므로 동시에 TOKEN_EXPIRED를 받은 요청들은 refresh를 한 번만 보낸다', async () => {
    let openRefresh = () => {};
    const refreshGate = new Promise<void>((resolve) => {
      openRefresh = resolve;
    });
    const fetchMock = mockRoutes({
      'GET /api/staff': [
        () => errorResponse('TOKEN_EXPIRED'),
        () => jsonResponse({ staff: true }, 200),
      ],
      'GET /api/sales': [
        () => errorResponse('TOKEN_EXPIRED'),
        () => jsonResponse({ sales: true }, 200),
      ],
      'POST /api/auth/refresh': [() => refreshGate.then(emptyResponse)],
    });

    const staff = fetcher('/api/staff');
    const sales = fetcher('/api/sales');
    await vi.waitFor(() =>
      expect(fetchMock.mock.calls.length).toBeGreaterThanOrEqual(3),
    );
    openRefresh();

    await expect(Promise.all([staff, sales])).resolves.toEqual([
      { staff: true },
      { sales: true },
    ]);
    expect(
      calledKeys(fetchMock).filter((key) => key === 'POST /api/auth/refresh'),
    ).toHaveLength(1);
  });

  it.each(['UNAUTHORIZED', 'INVALID_CREDENTIALS'])(
    '401 %s는 refresh하지 않는다',
    async (errorCode) => {
      const fetchMock = mockRoutes({
        'GET /api/staff': [() => errorResponse(errorCode)],
      });

      await expect(fetcher('/api/staff')).rejects.toMatchObject({
        errorCode,
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ['POST', '/api/auth/login'],
    ['POST', '/api/auth/refresh'],
    ['DELETE', '/api/auth/session'],
  ])(
    'refresh가 refresh를 부르는 반복을 막기 위해 %s %s 요청은 refresh하지 않는다',
    async (method, url) => {
      const fetchMock = mockRoutes({
        [`${method} ${url}`]: [() => errorResponse('TOKEN_EXPIRED')],
      });

      await expect(fetcher(url, { method })).rejects.toMatchObject({
        errorCode: 'TOKEN_EXPIRED',
      });
      expect(fetchMock).toHaveBeenCalledTimes(1);
    },
  );

  it('로그아웃 요청은 refresh 후 재시도한다', async () => {
    const fetchMock = mockRoutes({
      'POST /api/auth/logout': [
        () => errorResponse('TOKEN_EXPIRED'),
        emptyResponse,
      ],
      'POST /api/auth/refresh': [emptyResponse],
    });

    await expect(
      fetcher('/api/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('서버에서는 refresh하지 않는다', async () => {
    vi.unstubAllGlobals();
    vi.stubEnv('BE_BASE_URL', BE_BASE_URL);
    const fetchMock = mockRoutes({
      [`GET ${BE_BASE_URL}/api/staff`]: [() => errorResponse('TOKEN_EXPIRED')],
    });

    await expect(fetcher('/api/staff')).rejects.toMatchObject({
      errorCode: 'TOKEN_EXPIRED',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllEnvs();
  });
});
