const CALENDAR_TIME_ZONE = 'Asia/Seoul';
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_PATTERN = /^(\d{4})-(\d{2})$/;

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CALENDAR_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const monthFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: CALENDAR_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
});

const getFormattedPart = (
  parts: Intl.DateTimeFormatPart[],
  type: Intl.DateTimeFormatPartTypes,
) => parts.find((part) => part.type === type)?.value ?? '';

const isValidDateParts = (year: number, month: number, day: number) => {
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const parseCalendarDate = (value: string) => {
  const match = DATE_PATTERN.exec(value);

  if (!match) {
    throw new RangeError(`잘못된 캘린더 날짜 형식입니다: ${value}`);
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!isValidDateParts(year, month, day)) {
    throw new RangeError(`존재하지 않는 캘린더 날짜입니다: ${value}`);
  }

  return new Date(`${value}T00:00:00+09:00`);
};

const parseCalendarMonth = (value: string) => {
  const match = MONTH_PATTERN.exec(value);

  if (!match) {
    throw new RangeError(`잘못된 캘린더 월 형식입니다: ${value}`);
  }

  const [, yearText, monthText] = match;
  const month = Number(monthText);

  if (month < 1 || month > 12) {
    throw new RangeError(`존재하지 않는 캘린더 월입니다: ${value}`);
  }

  return new Date(`${yearText}-${monthText}-01T00:00:00+09:00`);
};

const formatCalendarDate = (date: Date) => {
  const parts = dateFormatter.formatToParts(date);

  return `${getFormattedPart(parts, 'year')}-${getFormattedPart(parts, 'month')}-${getFormattedPart(parts, 'day')}`;
};

const formatCalendarMonth = (date: Date) => {
  const parts = monthFormatter.formatToParts(date);

  return `${getFormattedPart(parts, 'year')}-${getFormattedPart(parts, 'month')}`;
};

const shiftCalendarMonth = (value: string, amount: number) => {
  parseCalendarMonth(value);

  const [year, month] = value.split('-').map(Number);
  const shiftedMonthIndex = year * 12 + month - 1 + amount;
  const nextYear = Math.floor(shiftedMonthIndex / 12);
  const nextMonth = (((shiftedMonthIndex % 12) + 12) % 12) + 1;

  if (nextYear < 0 || nextYear > 9999) {
    throw new RangeError(`캘린더 월 이동 범위를 벗어났습니다: ${value}`);
  }

  return `${String(nextYear).padStart(4, '0')}-${String(nextMonth).padStart(2, '0')}`;
};

const formatCalendarMonthLabel = (value: string) => {
  const match = MONTH_PATTERN.exec(value);

  if (!match) {
    throw new RangeError(`잘못된 캘린더 월 형식입니다: ${value}`);
  }

  parseCalendarMonth(value);

  return `${Number(match[1])}년 ${Number(match[2])}월`;
};

export {
  CALENDAR_TIME_ZONE,
  formatCalendarDate,
  formatCalendarMonth,
  formatCalendarMonthLabel,
  parseCalendarDate,
  parseCalendarMonth,
  shiftCalendarMonth,
};
