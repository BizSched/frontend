const formatCompactKrw = (value: number): string => {
  if (value === 0) return '0';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 100_000_000) {
    const billions = absValue / 100_000_000;
    const formatted = Number.isInteger(billions)
      ? String(billions)
      : billions.toFixed(1).replace(/\.0$/, '');
    return `${sign}${formatted}억`;
  }

  if (absValue >= 10_000) {
    const tenThousands = absValue / 10_000;
    const formatted = Number.isInteger(tenThousands)
      ? String(tenThousands)
      : tenThousands.toFixed(1).replace(/\.0$/, '');
    return `${sign}${formatted}만`;
  }

  return `${sign}${absValue.toLocaleString('ko-KR')}`;
};

export { formatCompactKrw };
