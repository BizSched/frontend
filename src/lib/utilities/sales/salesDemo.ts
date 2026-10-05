const createSalesDemoMonth = (year: number, month: number) => {
  const length = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length }, (_, index) => {
    const dayOfMonth = index + 1;
    const weekday = new Date(Date.UTC(year, month - 1, dayOfMonth)).getUTCDay();
    const demand = weekday === 0 || weekday === 6 ? 1.35 : 1;
    const trend = 1 + (year - 2025) * 0.08 + month * 0.006;
    const variation = 0.85 + ((dayOfMonth * 17 + month * 7) % 31) / 100;
    const amount = (base: number) =>
      Math.round((base * demand * trend * variation) / 100) * 100;
    const product = amount(295000);
    const service = amount(125000);
    const online = amount(weekday === 5 ? 255000 : 185000);
    const other = dayOfMonth % 7 === 0 ? 0 : amount(32000);
    return {
      id: dayOfMonth,
      date: `${month}월 ${dayOfMonth}일`,
      day: '일월화수목금토'[weekday],
      product,
      service,
      online,
      other,
      total: product + service + online + other,
    };
  });
};
export { createSalesDemoMonth };
