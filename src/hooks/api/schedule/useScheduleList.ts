'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { scheduleListQueryOptions } from '@hooks/api/schedule/scheduleQueryOptions';

import type { ScheduleListParams } from '@lib/api/entities/schedule/api';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

const excludeDeletedStaffSchedules = (schedules: PartTimeSchedule[]) =>
  schedules.filter(({ staff }) => !staff.isDeleted);

const useScheduleList = (params: ScheduleListParams) =>
  useQuery({
    ...scheduleListQueryOptions(params),
    placeholderData: keepPreviousData,
    select: excludeDeletedStaffSchedules,
  });

export { useScheduleList };
