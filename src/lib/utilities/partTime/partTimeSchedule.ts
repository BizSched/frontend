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

const formatPartTimeScheduleSummaryTitle = (date: string, today: string) => {
  if (date === today) {
    return '오늘의 스케쥴';
  }

  const [, month, day] = date.split('-');

  return `${Number(month)}월 ${Number(day)}일 스케쥴`;
};

export {
  comparePartTimeScheduleTime,
  formatPartTimeScheduleSummaryTitle,
  getPartTimeScheduleRange,
  getPartTimeScheduleStaffOptions,
  groupPartTimeSchedulesByDate,
};
