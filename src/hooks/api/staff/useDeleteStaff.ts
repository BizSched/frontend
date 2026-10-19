'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';

import { deleteStaff } from '@lib/api/entities/staff/api';
import type { PartTimeStaff } from '@lib/types/partTimeSchedule';
import type { PartTimeStaffListResponse } from '@lib/types/partTimeStaff';

import { staffKeys } from './staffQueryOptions';

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
  });
};

export { useDeleteStaff };
