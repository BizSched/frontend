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
