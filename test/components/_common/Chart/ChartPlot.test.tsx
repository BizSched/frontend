import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ChartPlot } from '@components/_common/Chart/ChartPlot';

afterEach(cleanup);

describe('ChartPlot', () => {
  it('relative 기본 클래스로 children을 렌더한다', () => {
    render(
      <ChartPlot data-testid="plot">
        <span>plot-children</span>
      </ChartPlot>,
    );

    expect(screen.getByTestId('plot')).toHaveClass('relative');
    expect(screen.getByText('plot-children')).toBeInTheDocument();
  });

  it('className을 기본 클래스와 병합한다', () => {
    render(<ChartPlot data-testid="plot" className="h-40" />);
    expect(screen.getByTestId('plot')).toHaveClass('relative', 'h-40');
  });
});
