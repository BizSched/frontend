import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { useChartContext } from '@hooks/chart/useChartContext';

import { ChartProvider } from '@providers/chart/ChartProvider';

afterEach(cleanup);

function Consumer() {
  const { config, data, size, isEmpty } = useChartContext();
  return (
    <span>
      {Object.keys(config).length}/{data.length}/{size}/{String(isEmpty)}
    </span>
  );
}

describe('ChartProvider', () => {
  it('config·data·size를 그대로 자식에 전달한다', () => {
    render(
      <ChartProvider
        config={{ a: { label: 'A', color: 'red' } }}
        data={[{ a: 1 }]}
        size="large"
      >
        <Consumer />
      </ChartProvider>,
    );

    expect(screen.getByText('1/1/large/false')).toBeInTheDocument();
  });
});
