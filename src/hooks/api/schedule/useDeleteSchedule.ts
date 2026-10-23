'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteSchedule } from '@lib/api/entities/schedule/api';

import { scheduleKeys } from './scheduleQueryOptions';

const useDeleteSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (scheduleId: number) => deleteSchedule(scheduleId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  });
};

export { useDeleteSchedule };
