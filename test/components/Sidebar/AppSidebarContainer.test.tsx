import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { SidebarProvider } from '@components/_common/Sidebar/SidebarProvider';
import { AppSidebarContainer } from '@components/Sidebar/AppSidebarContainer';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { endSession, redirectToLogin } from '@lib/api/authSession';
import { postLogout } from '@lib/api/entities/auth/api';
import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard' }));
vi.mock('@lib/api/entities/auth/api', () => ({ postLogout: vi.fn() }));
vi.mock('@lib/api/authSession', () => ({
  endSession: vi.fn(),
  redirectToLogin: vi.fn(),
}));
vi.mock('@components/_common/Modal/openConfirmModal', () => ({
  openConfirmModal: vi.fn(),
}));

const renderSidebar = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SidebarProvider>
        <AppSidebarContainer />
      </SidebarProvider>
    </QueryClientProvider>,
  );

const clickLogout = () =>
  fireEvent.click(screen.getByRole('button', { name: '로그아웃' }));

describe('AppSidebarContainer', () => {
  beforeEach(() => {
    vi.mocked(postLogout).mockReset();
    vi.mocked(redirectToLogin).mockReset();
    vi.mocked(endSession).mockReset();
    vi.mocked(openConfirmModal).mockReset();
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('라우터 캐시까지 지우기 위해 로그아웃 후 전체 새로고침으로 로그인 페이지에 간다', async () => {
    vi.mocked(postLogout).mockResolvedValue(undefined);
    renderSidebar();

    clickLogout();

    await waitFor(() => expect(redirectToLogin).toHaveBeenCalledTimes(1));
    expect(openConfirmModal).not.toHaveBeenCalled();
  });

  it('로그아웃 요청 중에 다시 눌러도 한 번만 요청한다', async () => {
    let resolveLogout = () => {};
    vi.mocked(postLogout).mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogout = resolve;
        }),
    );
    renderSidebar();

    clickLogout();
    await waitFor(() => expect(postLogout).toHaveBeenCalledTimes(1));
    clickLogout();
    resolveLogout();

    await waitFor(() => expect(redirectToLogin).toHaveBeenCalled());
    expect(postLogout).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['5xx', new Error('HTTP 500')],
    ['네트워크 오류', new NetworkError()],
  ])(
    '%s로 실패하면 이동하지 않고 재시도 확인 모달을 연다',
    async (_, error) => {
      vi.mocked(postLogout).mockRejectedValue(error);
      vi.mocked(openConfirmModal).mockResolvedValue(false);
      renderSidebar();

      clickLogout();

      await waitFor(() =>
        expect(openConfirmModal).toHaveBeenCalledWith({
          title: '로그아웃하지 못했어요',
          description: COMMON_ERROR_MESSAGE,
          confirmText: '다시 시도',
        }),
      );
      expect(redirectToLogin).not.toHaveBeenCalled();
    },
  );

  it('모달에서 다시 시도를 누르면 로그아웃을 다시 요청한다', async () => {
    vi.mocked(postLogout)
      .mockRejectedValueOnce(new Error('HTTP 500'))
      .mockResolvedValueOnce(undefined);
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    renderSidebar();

    clickLogout();

    await waitFor(() => expect(redirectToLogin).toHaveBeenCalledTimes(1));
    expect(postLogout).toHaveBeenCalledTimes(2);
  });

  it('모달을 취소하면 다시 요청하지 않는다', async () => {
    vi.mocked(postLogout).mockRejectedValue(new Error('HTTP 500'));
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    renderSidebar();

    clickLogout();

    await waitFor(() => expect(openConfirmModal).toHaveBeenCalled());
    expect(postLogout).toHaveBeenCalledTimes(1);
  });

  it('401은 세션 정리가 처리하므로 모달을 열지 않는다', async () => {
    vi.mocked(postLogout).mockRejectedValue(
      new ApiError('UNAUTHORIZED', 401, ''),
    );
    renderSidebar();

    clickLogout();

    await waitFor(() => expect(endSession).toHaveBeenCalled());
    expect(openConfirmModal).not.toHaveBeenCalled();
  });
});
