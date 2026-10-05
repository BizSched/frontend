import { createSalesDemoMonth } from '@lib/utilities/sales/salesDemo';

const SALES_DEMO_YEAR = 2026;
const SALES_DEMO_MONTH = 9;
const SALES_MONTH_LABEL = `${SALES_DEMO_MONTH}월`;
const SALES_MONTH_RECORDS = createSalesDemoMonth(
  SALES_DEMO_YEAR,
  SALES_DEMO_MONTH,
);
const SALES_MONTH_TOTAL = SALES_MONTH_RECORDS.reduce(
  (sum, record) => sum + record.total,
  0,
);
const SALES_PREVIOUS_MONTH_TOTAL = createSalesDemoMonth(
  SALES_DEMO_YEAR,
  SALES_DEMO_MONTH - 1,
)
  .slice(0, SALES_MONTH_RECORDS.length)
  .reduce((sum, record) => sum + record.total, 0);
const SALES_PREVIOUS_YEAR_TOTAL = createSalesDemoMonth(
  SALES_DEMO_YEAR - 1,
  SALES_DEMO_MONTH,
).reduce((sum, record) => sum + record.total, 0);
const SALES_MONTH_CHANGE =
  ((SALES_MONTH_TOTAL - SALES_PREVIOUS_MONTH_TOTAL) /
    SALES_PREVIOUS_MONTH_TOTAL) *
  100;
const SALES_YEAR_CHANGE = SALES_MONTH_TOTAL - SALES_PREVIOUS_YEAR_TOTAL;
const SALES_PERIOD = `${SALES_DEMO_YEAR}.${String(SALES_DEMO_MONTH).padStart(2, '0')}.01 ~ ${SALES_DEMO_YEAR}.${String(SALES_DEMO_MONTH).padStart(2, '0')}.${SALES_MONTH_RECORDS.length}`;

const SALES_CATEGORIES = (
  [
    { key: 'product', label: '상품 판매', color: '#ebddb9' },
    { key: 'service', label: '서비스', color: '#ffd98a' },
    { key: 'online', label: '배달·온라인', color: '#fff0c9' },
    { key: 'other', label: '기타', color: '#fff9ed' },
  ] as const
).map((category) => ({
  ...category,
  amount: SALES_MONTH_RECORDS.reduce(
    (sum, record) => sum + record[category.key],
    0,
  ),
}));

const firstWeekOffset =
  (new Date(Date.UTC(SALES_DEMO_YEAR, SALES_DEMO_MONTH - 1, 1)).getUTCDay() +
    6) %
  7;
const SALES_WEEKS = Array.from(
  { length: Math.ceil((firstWeekOffset + SALES_MONTH_RECORDS.length) / 7) },
  (_, index) => {
    const records = SALES_MONTH_RECORDS.filter(
      (record) => Math.floor((record.id - 1 + firstWeekOffset) / 7) === index,
    );
    return {
      label: `${index + 1}주`,
      product: records.reduce((sum, record) => sum + record.product, 0),
      service: records.reduce((sum, record) => sum + record.service, 0),
      online: records.reduce((sum, record) => sum + record.online, 0),
      other: records.reduce((sum, record) => sum + record.other, 0),
    };
  },
);
const SALES_RECORDS = SALES_MONTH_RECORDS.slice(-8).reverse();
const SALES_RECENT_TOTAL = SALES_RECORDS.reduce(
  (sum, record) => sum + record.total,
  0,
);

export {
  SALES_CATEGORIES,
  SALES_RECORDS,
  SALES_WEEKS,
  SALES_MONTH_LABEL,
  SALES_MONTH_RECORDS,
  SALES_MONTH_TOTAL,
  SALES_PREVIOUS_MONTH_TOTAL,
  SALES_PREVIOUS_YEAR_TOTAL,
  SALES_MONTH_CHANGE,
  SALES_YEAR_CHANGE,
  SALES_PERIOD,
  SALES_RECENT_TOTAL,
};
