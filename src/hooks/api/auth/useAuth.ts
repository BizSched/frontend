import { useMutation, useQueryClient } from '@tanstack/react-query';

import { isUnauthorizedError } from '@lib/api/apiError';
import { endSession } from '@lib/api/authSession';
import { postLogin, postLogout } from '@lib/api/entities/auth/api';

const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogin,
    // NOTE: 뒤로가기로 돌아온 로그인 화면에서 다른 계정으로 로그인하면 이전 사용자의 캐시가 남으므로 비운다
    onSuccess: () => queryClient.clear(),
  });
};

const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postLogout,
    onSuccess: () => queryClient.clear(),
    onError: (error) => {
      if (isUnauthorizedError(error)) void endSession();
    },
  });
};

export { useLoginMutation, useLogoutMutation };
