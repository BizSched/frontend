import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLogoutMutation } from '@hooks/api/auth/useAuth';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { endSession } from '@lib/api/authSession';
import { postLogout } from '@lib/api/entities/auth/api';

vi.mock('@lib/api/authSession', () => ({ endSession: vi.fn() }));
vi.mock('@lib/api/entities/auth/api', () => ({ postLogout: vi.fn() }));

const renderLogoutMutation = (queryClient: QueryClient) =>
  renderHook(() => useLogoutMutation(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  });

const createQueryClient = () => {
  const queryClient = new QueryClient();
  queryClient.setQueryData(['currentUser'], { name: '사장님' });
  return queryClient;
};

describe('useLogoutMutation', () => {
  beforeEach(() => {
    vi.mocked(postLogout).mockReset();
    vi.mocked(endSession).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it('로그아웃에 성공하면 쿼리 캐시를 비운다', async () => {
    vi.mocked(postLogout).mockResolvedValue(undefined);
    const queryClient = createQueryClient();
    const { result } = renderLogoutMutation(queryClient);

    act(() => result.current.mutate());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(queryClient.getQueryData(['currentUser'])).toBeUndefined();
    expect(endSession).not.toHaveBeenCalled();
  });

  it.each(['UNAUTHORIZED', 'TOKEN_EXPIRED'])(
    '사용자가 언제든 로그아웃할 수 있도록 401 %s로 실패하면 세션을 정리한다',
    async (errorCode) => {
      vi.mocked(postLogout).mockRejectedValue(new ApiError(errorCode, 401, ''));
      const { result } = renderLogoutMutation(createQueryClient());

      act(() => result.current.mutate());

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(endSession).toHaveBeenCalledTimes(1);
    },
  );

  it.each([
    ['5xx', new Error('HTTP 500')],
    ['네트워크 오류', new NetworkError()],
  ])(
    '쿠키만 지우면 BE refresh 토큰이 남으므로 %s로 실패하면 로그인 상태와 캐시를 유지한다',
    async (_, error) => {
      vi.mocked(postLogout).mockRejectedValue(error);
      const queryClient = createQueryClient();
      const { result } = renderLogoutMutation(queryClient);

      act(() => result.current.mutate());

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(endSession).not.toHaveBeenCalled();
      expect(queryClient.getQueryData(['currentUser'])).toEqual({
        name: '사장님',
      });
    },
  );
});
