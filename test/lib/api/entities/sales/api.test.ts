import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import {
  createSale,
  deleteSale,
  getSalesChart,
  getSalesList,
  getSalesMonthTotal,
  getSalesRatio,
  getSalesSummary,
  updateSale,
} from '@lib/api/entities/sales/api';
import {
  create3,
  _delete,
  findAll3,
  update,
} from '@lib/api/generated/sales/sales';
import {
  findChart,
  findRatio,
  findSummary,
} from '@lib/api/generated/sales-analytics/sales-analytics';

vi.mock('@lib/api/generated/sales/sales', () => ({
  create3: vi.fn(),
  _delete: vi.fn(),
  findAll3: vi.fn(),
  update: vi.fn(),
}));
vi.mock('@lib/api/generated/sales-analytics/sales-analytics', () => ({
  findChart: vi.fn(),
  findRatio: vi.fn(),
  findSummary: vi.fn(),
}));

const SALE = {
  id: 42,
  date: '2026-10-01',
  sales: [{ categoryId: 3, name: '음료', amount: 1200 }],
  totalAmount: 1200,
};
const SALE_REQUEST = {
  date: '2026-10-01',
  sales: [{ categoryId: 3, amount: 1200 }],
  totalAmount: 1200,
};
const SALES_PAGE = {
  page: 1,
  size: 10,
  items: [SALE],
  totalCount: 1,
  totalPage: 1,
};
const EMPTY_SALES_PAGE = {
  page: 1,
  size: 10,
  items: [],
  totalCount: 0,
  totalPage: 0,
};
const SUMMARY = {
  month: '2026-10',
  startDate: '2026-10-01',
  endDate: '2026-10-13',
  totalAmount: 1200,
  previousMonth: { totalAmount: 1000, changeRate: 20 },
  previousYear: { totalAmount: 900, changeAmount: 300 },
};

beforeEach(() => vi.resetAllMocks());

describe('getSalesList', () => {
  it('유효한 DTO를 매출 목록으로 변환하고 조회 파라미터와 옵션을 전달한다', async () => {
    const params = { month: '2026-10', page: 1, size: 10 };
    const options = { headers: { Authorization: 'Bearer token' } };
    vi.mocked(findAll3).mockResolvedValue(SALES_PAGE);

    await expect(getSalesList(params, options)).resolves.toEqual(SALES_PAGE);
    expect(findAll3).toHaveBeenCalledWith(params, options);
  });

  it('파라미터가 생략되면 전체 기간의 빈 목록을 반환한다', async () => {
    vi.mocked(findAll3).mockResolvedValue(EMPTY_SALES_PAGE);

    await expect(getSalesList()).resolves.toEqual(EMPTY_SALES_PAGE);
    expect(findAll3).toHaveBeenCalledWith(undefined, undefined);
  });
});

describe('getSalesMonthTotal', () => {
  it('요약 DTO에서 총매출만 반환하고 조회 인자를 전달한다', async () => {
    const params = { month: '2026-10' };
    const options = { cache: 'no-store' as const };
    vi.mocked(findSummary).mockResolvedValue(SUMMARY);

    await expect(getSalesMonthTotal(params, options)).resolves.toBe(1200);
    expect(findSummary).toHaveBeenCalledWith(params, options);
  });
});

const CHART = {
  unit: 'MONTH' as const,
  startDate: '2026-10-01',
  endDate: '2026-10-31',
  categories: [{ categoryId: 3, name: '음료', color: '#F26B1D' }],
  items: [
    {
      label: '1주',
      startDate: '2026-10-01',
      endDate: '2026-10-07',
      sales: [{ categoryId: 3, amount: 1200 }],
      totalAmount: 1200,
    },
  ],
};
const RATIO = {
  month: '2026-10',
  totalAmount: 1200,
  items: [
    {
      categoryId: 3,
      name: '음료',
      color: '#F26B1D',
      amount: 1200,
      percent: 100,
    },
  ],
};

describe('getSalesSummary', () => {
  it('요약 DTO를 DAO로 변환하고 조회 인자를 전달한다', async () => {
    const params = { month: '2026-10' };
    const options = { cache: 'no-store' as const };
    vi.mocked(findSummary).mockResolvedValue(SUMMARY);

    await expect(getSalesSummary(params, options)).resolves.toMatchObject({
      totalAmount: 1200,
      previousMonth: { changeRate: 20 },
    });
    expect(findSummary).toHaveBeenCalledWith(params, options);
  });

  it('응답 DTO가 잘못되면 ZodError를 던진다', async () => {
    vi.mocked(findSummary).mockResolvedValue({
      ...SUMMARY,
      totalAmount: '1200',
    } as never);

    await expect(getSalesSummary()).rejects.toBeInstanceOf(ZodError);
  });
});

describe('getSalesChart', () => {
  it('차트 DTO를 DAO로 변환하고 필수 조회 인자를 전달한다', async () => {
    const params = { unit: 'MONTH' as const, date: '2026-10-13' };
    const options = { cache: 'no-store' as const };
    vi.mocked(findChart).mockResolvedValue(CHART);

    await expect(getSalesChart(params, options)).resolves.toMatchObject({
      unit: 'MONTH',
      rows: [{ label: '1주', totalAmount: 1200, '3': 1200 }],
    });
    expect(findChart).toHaveBeenCalledWith(params, options);
  });

  it('응답 DTO가 잘못되면 ZodError를 던진다', async () => {
    vi.mocked(findChart).mockResolvedValue({
      ...CHART,
      unit: 'DAY',
    } as never);

    await expect(getSalesChart({ unit: 'MONTH' })).rejects.toBeInstanceOf(
      ZodError,
    );
  });
});

describe('getSalesRatio', () => {
  it('비중 DTO를 DAO로 변환하고 조회 인자를 전달한다', async () => {
    const params = { month: '2026-10' };
    const options = { cache: 'no-store' as const };
    vi.mocked(findRatio).mockResolvedValue(RATIO);

    await expect(getSalesRatio(params, options)).resolves.toEqual(RATIO);
    expect(findRatio).toHaveBeenCalledWith(params, options);
  });

  it('응답 DTO가 잘못되면 ZodError를 던진다', async () => {
    vi.mocked(findRatio).mockResolvedValue({
      ...RATIO,
      items: [{ ...RATIO.items[0], percent: '100' }],
    } as never);

    await expect(getSalesRatio()).rejects.toBeInstanceOf(ZodError);
  });
});

describe('createSale', () => {
  it('생성 응답을 매출 DAO로 반환한다', async () => {
    vi.mocked(create3).mockResolvedValue(SALE);

    await expect(createSale(SALE_REQUEST)).resolves.toEqual(SALE);
    expect(create3).toHaveBeenCalledWith(SALE_REQUEST);
  });

  it('응답 DTO가 잘못되면 ZodError를 던진다', async () => {
    vi.mocked(create3).mockResolvedValue({
      ...SALE,
      totalAmount: '1200',
    } as never);

    await expect(createSale(SALE_REQUEST)).rejects.toBeInstanceOf(ZodError);
  });
});

describe('updateSale', () => {
  it('수정 ID와 요청 본문을 전달하고 응답을 매출 DAO로 반환한다', async () => {
    vi.mocked(update).mockResolvedValue(SALE);

    await expect(updateSale(42, SALE_REQUEST)).resolves.toEqual(SALE);
    expect(update).toHaveBeenCalledWith(42, SALE_REQUEST);
  });

  it('응답 DTO가 잘못되면 ZodError를 던진다', async () => {
    vi.mocked(update).mockResolvedValue({
      ...SALE,
      totalAmount: '1200',
    } as never);

    await expect(updateSale(42, SALE_REQUEST)).rejects.toBeInstanceOf(ZodError);
  });
});

describe('deleteSale', () => {
  it('매출 ID를 전달하고 응답 본문 없이 완료한다', async () => {
    vi.mocked(_delete).mockResolvedValue(undefined);

    await expect(deleteSale(42)).resolves.toBeUndefined();
    expect(_delete).toHaveBeenCalledWith(42);
  });
});
