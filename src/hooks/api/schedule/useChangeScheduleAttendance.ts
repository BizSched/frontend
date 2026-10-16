'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { ChangeScheduleAttendanceVariables } from '@hooks/types/scheduleMutation';

import { changeScheduleAttendance } from '@lib/api/entities/schedule/api';

import { scheduleKeys } from './scheduleQueryOptions';

const useChangeScheduleAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ scheduleId, body }: ChangeScheduleAttendanceVariables) =>
      changeScheduleAttendance(scheduleId, body),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all }),
  });
};

export { useChangeScheduleAttendance };
