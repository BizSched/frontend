// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const assign = vi.fn();

const loadAuthSession = async () => {
  vi.resetModules();
  return import('@lib/api/authSession');
};

describe('authSession', () => {
  beforeEach(() => {
    assign.mockReset();
    vi.stubGlobal('window', { location: { assign } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('endSession', () => {
    it('세션 정리 요청 후 로그인 페이지로 이동한다', async () => {
      const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
      vi.stubGlobal('fetch', fetchMock);
      const { endSession } = await loadAuthSession();

      await endSession();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/session',
        expect.objectContaining({ method: 'DELETE' }),
      );
      expect(assign).toHaveBeenCalledWith('/login');
    });

    it('세션 정리 후에는 페이지를 떠나므로 끝난 뒤 다시 불러도 한 번만 실행한다', async () => {
      const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
      vi.stubGlobal('fetch', fetchMock);
      const { endSession } = await loadAuthSession();

      await endSession();
      await endSession();

      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(assign).toHaveBeenCalledTimes(1);
    });

    it('세션 정리 요청이 실패해도 로그인 페이지로 이동한다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(async () => {
          throw new TypeError('fetch failed');
        }),
      );
      const { endSession } = await loadAuthSession();

      await endSession();

      expect(assign).toHaveBeenCalledWith('/login');
    });
  });

  describe('refreshSession', () => {
    it('실패해도 호출부가 원래 요청을 재시도할 수 있게 에러를 던지지 않는다', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(
          async () =>
            new Response(
              JSON.stringify({ code: 401, message: '', errorCode: 'X' }),
              { status: 401 },
            ),
        ),
      );
      const { refreshSession } = await loadAuthSession();

      await expect(refreshSession()).resolves.toBeUndefined();
    });

    it('끝난 뒤 다시 부르면 refresh를 새로 보낸다', async () => {
      const fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
      vi.stubGlobal('fetch', fetchMock);
      const { refreshSession } = await loadAuthSession();

      await refreshSession();
      await refreshSession();

      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
