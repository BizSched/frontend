'use client';

import { toast } from '@components/_common/Toast/Toaster';
import { AppSidebar } from '@components/Sidebar/AppSidebar';

import { useLogoutMutation } from '@hooks/api/auth/useAuth';

import { isUnauthorizedError } from '@lib/api/apiError';
import { redirectToLogin } from '@lib/api/authSession';
import { formatAuthError } from '@lib/api/entities/auth/formatAuthError';

const LOGOUT_ERROR_TOAST_ID = 'logout-error';

function AppSidebarContainer() {
  const { mutate: logout, isPending, isSuccess } = useLogoutMutation();

  const handleLogoutClick = () => {
    if (isPending || isSuccess) return;
    toast.dismiss(LOGOUT_ERROR_TOAST_ID);
    logout(undefined, {
      onSuccess: redirectToLogin,
      onError: (error) => {
        if (isUnauthorizedError(error)) return;

        toast.error('로그아웃하지 못했어요', {
          id: LOGOUT_ERROR_TOAST_ID,
          description: formatAuthError(error),
        });
      },
    });
  };

  return <AppSidebar onLogoutClick={handleLogoutClick} />;
}

export { AppSidebarContainer };
