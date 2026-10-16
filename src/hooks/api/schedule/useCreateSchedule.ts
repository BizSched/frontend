'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createSchedule } from '@lib/api/entities/schedule/api';
import type { ScheduleCreateRequest } from '@lib/api/generated/bizSchedAPI.schemas';

import { scheduleKeys } from './scheduleQueryOptions';

const useCreateSchedule = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ScheduleCreateRequest) => createSchedule(body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  });
};

export { useCreateSchedule };
