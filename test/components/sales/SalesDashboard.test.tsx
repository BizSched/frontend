import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { SalesDashboard } from '@components/sales/SalesDashboard';

afterEach(cleanup);

describe('SalesDashboard', () => {
  it('매출 현황 영역과 공통 Table 기반 최근 내역을 표시한다', () => {
    render(<SalesDashboard />);

    expect(
      screen.getByRole('heading', { name: '매출 대시보드', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText('이번달 누적')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '매출 차트' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: '카테고리 구성' }),
    ).toBeInTheDocument();

    const table = screen.getByRole('table', { name: '입력한 매출' });
    expect(
      within(table).getByRole('columnheader', { name: '날짜' }),
    ).toBeInTheDocument();
    expect(
      within(table).getByRole('columnheader', { name: '합계' }),
    ).toBeInTheDocument();
    expect(within(table).getAllByText('₩756,300')).toHaveLength(7);
  });
});
