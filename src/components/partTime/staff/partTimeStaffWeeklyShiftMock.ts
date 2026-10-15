import type { PartTimeStaffShift } from '@lib/types/partTimeStaff';
import { getPartTimeStaffWeekDates } from '@lib/utilities/partTime/partTimeStaff';

const MOCK_WEEKLY_SHIFTS = [
  { dayIndex: 0, startTime: '17:00', endTime: '22:00', isMissed: false },
  { dayIndex: 2, startTime: '17:00', endTime: '22:00', isMissed: true },
  { dayIndex: 4, startTime: '17:00', endTime: '22:00', isMissed: false },
  { dayIndex: 5, startTime: '09:00', endTime: '13:00', isMissed: false },
  { dayIndex: 6, startTime: '17:00', endTime: '22:00', isMissed: false },
];

const getPartTimeStaffWeeklyShiftMocks = (
  staffId: number,
  now: string,
): PartTimeStaffShift[] => {
  const weekDates = getPartTimeStaffWeekDates(now.slice(0, 10));
  return MOCK_WEEKLY_SHIFTS.map(
    ({ dayIndex, startTime, endTime, isMissed }) => {
      const date = weekDates[dayIndex];
      return {
        id: staffId * 100 + dayIndex,
        date,
        startTime,
        endTime,
        isCheckedIn: !isMissed && `${date}T${endTime}` <= now,
      };
    },
  );
};

export { getPartTimeStaffWeeklyShiftMocks };
