import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useChartContext } from '@hooks/chart/useChartContext';

import { ChartProvider } from '@providers/chart/ChartProvider';

afterEach(cleanup);

function Consumer() {
  const { config, data, size, isEmpty, total } = useChartContext();
  return (
    <span>
      {Object.keys(config).length}/{data.length}/{size}/{String(isEmpty)}/
      {total}
    </span>
  );
}

describe('ChartProvider', () => {
  it('config·data·size를 그대로 자식에 전달하고 total을 계산한다', () => {
    render(
      <ChartProvider
        config={{ a: { label: 'A', color: 'red' } }}
        data={[{ a: 10 }]}
        size="large"
      >
        <Consumer />
      </ChartProvider>,
    );

    expect(screen.getByText('1/1/large/false/10')).toBeInTheDocument();
  });

  it('data가 있어도 모든 값의 합이 0이면 isEmpty다', () => {
    render(
      <ChartProvider
        config={{ a: { label: 'A', color: 'red' } }}
        data={[{ a: 0 }]}
        size="large"
      >
        <Consumer />
      </ChartProvider>,
    );

    expect(screen.getByText('1/1/large/true/0')).toBeInTheDocument();
  });
});
