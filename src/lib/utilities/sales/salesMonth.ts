const SALES_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export const isSalesMonth = (
  value: string | null | undefined,
): value is string =>
  typeof value === 'string' && SALES_MONTH_PATTERN.test(value);

export const getCurrentSalesMonth = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    calendar: 'gregory',
    month: '2-digit',
    timeZone: 'Asia/Seoul',
    year: 'numeric',
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;

  return `${year}-${month}`;
};
