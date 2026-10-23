const SALES_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const getSeoulDateParts = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).formatToParts(new Date());
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;

  return { year: pick('year'), month: pick('month'), day: pick('day') };
};

export const isSalesMonth = (
  value: string | null | undefined,
): value is string =>
  typeof value === 'string' && SALES_MONTH_PATTERN.test(value);

export const getCurrentSalesMonth = () => {
  const { year, month } = getSeoulDateParts();

  return `${year}-${month}`;
};

export const getCurrentSalesDate = () => {
  const { year, month, day } = getSeoulDateParts();

  return `${year}-${month}-${day}`;
};
