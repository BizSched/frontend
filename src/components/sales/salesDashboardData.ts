interface SalesWeek {
  label: string;
  product: number;
  service: number;
  online: number;
  other: number;
}

interface SalesCategory {
  key: string;
  label: string;
  amount: number;
  color: string;
}

interface SalesRecord {
  id: number;
  date: string;
  day: string;
  product: number;
  service: number;
  online: number;
  other: number;
  total: number;
}

const SALES_WEEKS: SalesWeek[] = [
  {
    label: '1주',
    product: 1550000,
    service: 1000000,
    online: 700000,
    other: 350000,
  },
  {
    label: '2주',
    product: 1600000,
    service: 900000,
    online: 800000,
    other: 380000,
  },
  {
    label: '3주',
    product: 1650000,
    service: 950000,
    online: 650000,
    other: 400000,
  },
  {
    label: '4주',
    product: 1750000,
    service: 1250000,
    online: 850000,
    other: 450000,
  },
  {
    label: '5주',
    product: 2050000,
    service: 1400000,
    online: 1050000,
    other: 500000,
  },
];

const SALES_CATEGORIES: SalesCategory[] = [
  { key: 'product', label: '상품 판매', amount: 32, color: '#ccae6e' },
  { key: 'service', label: '서비스', amount: 18, color: '#fff0c9' },
  { key: 'event', label: '이벤트', amount: 0, color: '#ebddb9' },
  { key: 'online', label: '배달·온라인', amount: 28, color: '#ffd98a' },
  { key: 'other', label: '기타', amount: 22, color: '#ffe6b3' },
];

const SALES_RECORDS: SalesRecord[] = Array.from({ length: 7 }, (_, index) => ({
  id: index + 1,
  date: '9월 11일',
  day: '금',
  product: 183400,
  service: 148700,
  online: 351900,
  other: 72300,
  total: 756300,
}));

export { SALES_CATEGORIES, SALES_RECORDS, SALES_WEEKS };
export type { SalesCategory, SalesRecord, SalesWeek };
