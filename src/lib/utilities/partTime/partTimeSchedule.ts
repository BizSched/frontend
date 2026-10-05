import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

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
  groupPartTimeSchedulesByDate,
};
