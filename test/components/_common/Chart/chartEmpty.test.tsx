import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ChartEmpty } from '@components/_common/Chart/ChartEmpty';

import { ChartProvider } from '@providers/chart/ChartProvider';

afterEach(cleanup);

describe('ChartEmpty', () => {
  it('isEmpty일 때만 children을 렌더한다', () => {
    const { rerender } = render(
      <ChartProvider config={{}} data={[]} size="large">
        <ChartEmpty>데이터 없음</ChartEmpty>
      </ChartProvider>,
    );
    expect(screen.getByText('데이터 없음')).toBeInTheDocument();

    rerender(
      <ChartProvider
        config={{ a: { color: 'red' } }}
        data={[{ a: 1 }]}
        size="large"
      >
        <ChartEmpty>데이터 없음</ChartEmpty>
      </ChartProvider>,
    );
    expect(screen.queryByText('데이터 없음')).not.toBeInTheDocument();
  });
});
