import type {
  PartTimeStaffDetailItem,
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
  PartTimeStaffDetailItem['gender'],
  string
> = {
  male: '남성',
  female: '여성',
};

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

const formatPartTimeStaffBirthDate = (birthDate: string) =>
  birthDate.slice(0, 10).replaceAll('-', '.');

const formatPartTimeStaffGender = (gender: PartTimeStaffDetailItem['gender']) =>
  PART_TIME_STAFF_GENDER_LABELS[gender];

const formatPartTimeStaffHourlyWage = (hourlyWage: number) =>
  `${hourlyWage.toLocaleString('ko-KR')}원`;

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

  return `${todayDate.getUTCMonth() + 1}월 ${WEEK_OF_MONTH_LABELS[weekIndex]} 주 근무 스케쥴`;
};

export {
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
