import { TZDate } from 'react-day-picker';

const CALENDAR_TIME_ZONE = 'Asia/Seoul';

const toCalendarDate = (value: string): TZDate => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  const [year, month, day] = value.split('-').map(Number);
  const date = new TZDate(2000, 0, 1, 12, 0, 0, CALENDAR_TIME_ZONE);
  date.setFullYear(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new RangeError(`Invalid calendar date: ${value}`);
  }
  return date;
};

const toCalendarMonth = (value: string): TZDate => {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    throw new RangeError(`Invalid calendar month: ${value}`);
  }
  return toCalendarDate(`${value}-01`);
};

const formatCalendarDate = (date: Date): string => {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid calendar date');
  }
  const seoulDate = new TZDate(date.getTime(), CALENDAR_TIME_ZONE);
  return `${String(seoulDate.getFullYear()).padStart(4, '0')}-${String(seoulDate.getMonth() + 1).padStart(2, '0')}-${String(seoulDate.getDate()).padStart(2, '0')}`;
};

const formatCalendarMonth = (date: Date): string =>
  formatCalendarDate(date).slice(0, 7);

export {
  CALENDAR_TIME_ZONE,
  toCalendarDate,
  toCalendarMonth,
  formatCalendarDate,
  formatCalendarMonth,
};
