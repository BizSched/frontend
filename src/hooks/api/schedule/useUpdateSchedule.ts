'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UpdateScheduleVariables } from '@hooks/types/scheduleMutation';

import { updateSchedule } from '@lib/api/entities/schedule/api';

import { scheduleKeys } from './scheduleQueryOptions';

const useUpdateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, body }: UpdateScheduleVariables) =>
      updateSchedule(scheduleId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  });
};

export { useUpdateSchedule };
