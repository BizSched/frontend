import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ChartCenter } from '@components/_common/Chart/ChartCenter';

import { ChartProvider } from '@providers/chart/ChartProvider';
import type { ChartSize } from '@providers/types/chart';

afterEach(cleanup);

const renderCenter = (size: ChartSize, className?: string) =>
  render(
    <ChartProvider config={{}} data={[{}]} size={size}>
      <ChartCenter
        label="10월 매출"
        value="000,000 원"
        className={className}
        data-testid="center"
      />
    </ChartProvider>,
  );

describe('ChartCenter', () => {
  it.each([
    { size: 'large', classes: ['text-base', 'font-bold'] },
    { size: 'small', classes: ['text-[0.625rem]', 'leading-3', 'font-bold'] },
  ] as const)(
    'Context size가 $size 일 때 label·value에 같은 글자 스타일을 적용한다',
    ({ size, classes }) => {
      renderCenter(size);

      expect(screen.getByText('10월 매출')).toHaveClass(...classes);
      expect(screen.getByText('000,000 원')).toHaveClass(...classes);
    },
  );

  it('className을 병합한다', () => {
    renderCenter('large', 'gap-2');
    expect(screen.getByTestId('center')).toHaveClass('gap-2');
  });
});
