import type {
  PartTimeStaffDetailItem,
  PartTimeStaffEmploymentStatus,
  PartTimeStaffShift,
  PartTimeStaffShiftStatus,
} from '@lib/types/partTimeStaff';
import {
  CALENDAR_TIME_ZONE,
  formatCalendarDate,
} from '@lib/utilities/calendar/calendarDate';

const timeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: CALENDAR_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const PART_TIME_STAFF_GENDER_LABELS: Record<
  NonNullable<PartTimeStaffDetailItem['gender']>,
  string
> = {
  male: '남성',
  female: '여성',
};

const PART_TIME_STAFF_EMPLOYMENT_STATUS_LABELS: Record<
  PartTimeStaffEmploymentStatus,
  string
> = {
  employed: '재직',
  onLeave: '휴직',
  resigned: '퇴사',
};

const PART_TIME_STAFF_EMPLOYMENT_STATUSES: PartTimeStaffEmploymentStatus[] = [
  'employed',
  'onLeave',
  'resigned',
];

const WEEK_OF_MONTH_LABELS = [
  '첫째',
  '둘째',
  '셋째',
  '넷째',
  '다섯째',
  '여섯째',
];

const DAYS_IN_WEEK = 7;

const toUtcDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number);

  return new Date(Date.UTC(year, month - 1, day));
};

const getMondayBasedDayIndex = (date: Date) => (date.getUTCDay() + 6) % 7;

const shiftDate = (date: string, amount: number) => {
  const shiftedDate = toUtcDate(date);
  shiftedDate.setUTCDate(shiftedDate.getUTCDate() + amount);

  return shiftedDate.toISOString().slice(0, 10);
};

const formatPartTimeStaffNow = (date: Date) =>
  `${formatCalendarDate(date)}T${timeFormatter.format(date)}`;

const getPartTimeStaffShiftStatus = (
  { date, startTime, endTime, isCheckedIn }: PartTimeStaffShift,
  now: string,
): PartTimeStaffShiftStatus => {
  if (isCheckedIn) {
    return 'completed';
  }

  const endDate = endTime <= startTime ? shiftDate(date, 1) : date;

  return `${endDate}T${endTime}` <= now ? 'missed' : 'scheduled';
};

const formatPartTimeStaffCreatedAt = (createdAt: string) =>
  createdAt.slice(0, 10).replaceAll('-', '. ');

const formatPartTimeStaffBirthDate = (birthDate?: string | null) =>
  birthDate ? birthDate.slice(0, 10).replaceAll('-', '.') : '-';

const formatPartTimeStaffGender = (
  gender: PartTimeStaffDetailItem['gender'],
) => (gender ? PART_TIME_STAFF_GENDER_LABELS[gender] : '-');

const formatPartTimeStaffHourlyWage = (hourlyWage?: number | null) =>
  hourlyWage === null || hourlyWage === undefined
    ? '-'
    : `${hourlyWage.toLocaleString('ko-KR')}원`;

const formatPartTimeStaffShiftTime = ({
  startTime,
  endTime,
}: PartTimeStaffShift) => `${startTime}~${endTime}`;

const getPartTimeStaffWeekDates = (today: string) => {
  const todayDate = toUtcDate(today);
  const mondayOffset = getMondayBasedDayIndex(todayDate);

  return Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    shiftDate(today, index - mondayOffset),
  );
};

const formatPartTimeStaffWeekTitle = (today: string) => {
  const todayDate = toUtcDate(today);
  const firstDate = new Date(
    Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), 1),
  );
  const weekIndex = Math.floor(
    (todayDate.getUTCDate() - 1 + getMondayBasedDayIndex(firstDate)) /
      DAYS_IN_WEEK,
  );

  return `${todayDate.getUTCMonth() + 1}월 ${WEEK_OF_MONTH_LABELS[weekIndex]} 주 근무 스케줄`;
};

export {
  PART_TIME_STAFF_EMPLOYMENT_STATUS_LABELS,
  PART_TIME_STAFF_EMPLOYMENT_STATUSES,
  formatPartTimeStaffBirthDate,
  formatPartTimeStaffCreatedAt,
  formatPartTimeStaffGender,
  formatPartTimeStaffHourlyWage,
  formatPartTimeStaffNow,
  formatPartTimeStaffShiftTime,
  formatPartTimeStaffWeekTitle,
  getPartTimeStaffShiftStatus,
  getPartTimeStaffWeekDates,
};
