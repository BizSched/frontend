'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { match, P } from 'ts-pattern';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';

import { ApiError } from '@lib/api/apiError';
import { changeStaffEmploymentStatus } from '@lib/api/entities/staff/api';
import type { PartTimeStaff } from '@lib/types/partTimeSchedule';
import type {
  PartTimeStaffDetailItem,
  PartTimeStaffEmploymentStatus,
  PartTimeStaffListResponse,
} from '@lib/types/partTimeStaff';

import { staffKeys } from './staffQueryOptions';

interface ChangeStaffEmploymentStatusVariables {
  staffId: number;
  employmentStatus: PartTimeStaffEmploymentStatus;
}

const isStaffNotFoundError = (error: unknown) =>
  match(error)
    .with(
      P.instanceOf(ApiError),
      ({ errorCode }) => errorCode === 'STAFF_NOT_FOUND',
    )
    .otherwise(() => false);

const useChangeStaffEmploymentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      staffId,
      employmentStatus,
    }: ChangeStaffEmploymentStatusVariables) =>
      changeStaffEmploymentStatus(staffId, employmentStatus),
    onSuccess: async ({ id, employmentStatus }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: staffKeys.lists() }),
        queryClient.cancelQueries({ queryKey: staffKeys.detail(id) }),
      ]);
      queryClient.setQueryData<PartTimeStaffDetailItem>(
        staffKeys.detail(id),
        (data) => data && { ...data, employmentStatus },
      );
      queryClient.setQueriesData<PartTimeStaffListResponse | PartTimeStaff[]>(
        { queryKey: staffKeys.lists() },
        (data) =>
          !data || Array.isArray(data)
            ? data
            : {
                ...data,
                items: data.items.map((item) =>
                  item.id === id ? { ...item, employmentStatus } : item,
                ),
              },
      );

      void queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: staffKeys.detail(id) });
      void queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
    },
    onError: (error, { staffId }) => {
      if (!isStaffNotFoundError(error)) return;

      void queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: staffKeys.detail(staffId),
      });
    },
  });
};

export { useChangeStaffEmploymentStatus };
