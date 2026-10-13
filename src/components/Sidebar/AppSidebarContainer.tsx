'use client';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { AppSidebar } from '@components/Sidebar/AppSidebar';

import { useLogoutMutation } from '@hooks/api/auth/useAuth';

import { isUnauthorizedError } from '@lib/api/apiError';
import { redirectToLogin } from '@lib/api/authSession';
import { formatAuthError } from '@lib/api/entities/auth/formatAuthError';

const LOGOUT_FAILURE_MODAL = {
  title: '로그아웃하지 못했어요',
  confirmText: '다시 시도',
} as const;

function AppSidebarContainer() {
  const { mutate: logout, isPending, isSuccess } = useLogoutMutation();

  const requestLogout = () => {
    logout(undefined, {
      onSuccess: redirectToLogin,
      onError: async (error) => {
        if (isUnauthorizedError(error)) return;

        const isRetryConfirmed = await openConfirmModal({
          ...LOGOUT_FAILURE_MODAL,
          description: formatAuthError(error),
        });
        if (isRetryConfirmed) requestLogout();
      },
    });
  };

  const handleLogoutClick = () => {
    if (isPending || isSuccess) return;
    requestLogout();
  };

  return <AppSidebar onLogoutClick={handleLogoutClick} />;
}

export { AppSidebarContainer };
