'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { match, P } from 'ts-pattern';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';

import { ApiError } from '@lib/api/apiError';
import { deleteStaff } from '@lib/api/entities/staff/api';
import type { PartTimeStaff } from '@lib/types/partTimeSchedule';
import type { PartTimeStaffListResponse } from '@lib/types/partTimeStaff';

import { staffKeys } from './staffQueryOptions';

const isStaffNotFoundError = (error: unknown) =>
  match(error)
    .with(
      P.instanceOf(ApiError),
      ({ errorCode }) => errorCode === 'STAFF_NOT_FOUND',
    )
    .otherwise(() => false);

const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: number) => deleteStaff(staffId),
    onSuccess: async (staffId) => {
      await queryClient.cancelQueries({ queryKey: staffKeys.lists() });
      queryClient.setQueriesData<PartTimeStaffListResponse | PartTimeStaff[]>(
        { queryKey: staffKeys.lists() },
        (data) => {
          if (!data) return data;
          if (Array.isArray(data)) {
            return data.filter(({ id }) => id !== staffId);
          }
          return {
            ...data,
            items: data.items.filter(({ id }) => id !== staffId),
          };
        },
      );

      void queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: staffKeys.detail(staffId),
      });
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
    onError: (error, staffId) => {
      if (!isStaffNotFoundError(error)) return;

      void queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: staffKeys.detail(staffId),
      });
    },
  });
};

export { useDeleteStaff };
