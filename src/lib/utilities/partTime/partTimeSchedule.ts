import type {
  PartTimeSchedule,
  PartTimeStaff,
} from '@lib/types/partTimeSchedule';
import { parseCalendarMonth } from '@lib/utilities/calendar/calendarDate';

const toIsoDate = (date: Date) => date.toISOString().slice(0, 10);

const getPartTimeScheduleRange = (month: string) => {
  parseCalendarMonth(month);
  const [year, monthNumber] = month.split('-').map(Number);
  const firstDate = new Date(Date.UTC(year, monthNumber - 1, 1));
  const lastDate = new Date(Date.UTC(year, monthNumber, 0));
  firstDate.setUTCDate(
    firstDate.getUTCDate() - ((firstDate.getUTCDay() + 6) % 7),
  );
  lastDate.setUTCDate(lastDate.getUTCDate() + ((7 - lastDate.getUTCDay()) % 7));

  return { from: toIsoDate(firstDate), to: toIsoDate(lastDate) };
};

const getPartTimeScheduleStaffOptions = (
  staffs: PartTimeStaff[],
  schedule?: PartTimeSchedule,
) =>
  !schedule || staffs.some(({ id }) => id === schedule.staff.id)
    ? staffs
    : [schedule.staff, ...staffs];

const comparePartTimeScheduleTime = (
  a: PartTimeSchedule,
  b: PartTimeSchedule,
) =>
  a.startTime.localeCompare(b.startTime) || a.endTime.localeCompare(b.endTime);

const groupPartTimeSchedulesByDate = (schedules: PartTimeSchedule[]) =>
  schedules.reduce<Record<string, PartTimeSchedule[]>>((groups, schedule) => {
    (groups[schedule.date] ??= []).push(schedule);
    return groups;
  }, {});

const SHIFT_PERIODS = ['오전', '오후', '저녁', '야간'] as const;

type ShiftPeriod = (typeof SHIFT_PERIODS)[number];

const getShiftPeriod = (startTime: string): ShiftPeriod => {
  if (startTime < '13:00') return '오전';
  if (startTime < '18:00') return '오후';
  if (startTime < '22:00') return '저녁';
  return '야간';
};

const groupPartTimeSchedulesByShift = (schedules: PartTimeSchedule[]) => {
  const groups: Record<ShiftPeriod, PartTimeSchedule[]> = {
    오전: [],
    오후: [],
    저녁: [],
    야간: [],
  };
  [...schedules]
    .sort(comparePartTimeScheduleTime)
    .forEach((schedule) =>
      groups[getShiftPeriod(schedule.startTime)].push(schedule),
    );
  return groups;
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const formatPartTimeScheduleDuration = (startTime: string, endTime: string) => {
  const total = toMinutes(endTime) - toMinutes(startTime);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return [hours && `${hours}시간`, minutes && `${minutes}분`]
    .filter(Boolean)
    .join(' ');
};

const formatPartTimeScheduleSummaryTitle = (date: string, today: string) => {
  if (date === today) {
    return '오늘의 스케쥴';
  }

  const [, month, day] = date.split('-');

  return `${Number(month)}월 ${Number(day)}일 스케쥴`;
};

export {
  comparePartTimeScheduleTime,
  formatPartTimeScheduleDuration,
  formatPartTimeScheduleSummaryTitle,
  getPartTimeScheduleRange,
  getPartTimeScheduleStaffOptions,
  getShiftPeriod,
  groupPartTimeSchedulesByDate,
  groupPartTimeSchedulesByShift,
  SHIFT_PERIODS,
};
export type { ShiftPeriod };
