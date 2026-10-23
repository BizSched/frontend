'use client';

import { useQuery } from '@tanstack/react-query';

import { scheduleListQueryOptions } from '@hooks/api/schedule/scheduleQueryOptions';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import type { PartTimeStaffShift } from '@lib/types/partTimeStaff';
import { getPartTimeStaffWeekDates } from '@lib/utilities/partTime/partTimeStaff';

const toPartTimeStaffShifts = (
  schedules: PartTimeSchedule[],
): PartTimeStaffShift[] =>
  schedules.map(({ id, date, startTime, endTime, isCheckedIn }) => ({
    id,
    date,
    startTime,
    endTime,
    isCheckedIn,
  }));

const useStaffWeeklyShifts = (staffId: number, now: string) => {
  const weekDates = getPartTimeStaffWeekDates(now.slice(0, 10));

  return useQuery({
    ...scheduleListQueryOptions({
      from: weekDates[0],
      to: weekDates[weekDates.length - 1],
      staffId,
    }),
    enabled: Number.isSafeInteger(staffId) && staffId > 0,
    throwOnError: false,
    select: toPartTimeStaffShifts,
  });
};

export { useStaffWeeklyShifts };
