import '@testing-library/jest-dom/vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ChartRoot } from '@components/_common/Chart/ChartRoot';

import { useChartContext } from '@hooks/chart/useChartContext';

afterEach(cleanup);

function ConfigProbe() {
  const { size } = useChartContext();
  return <span>size:{size}</span>;
}

describe('ChartRoot', () => {
  it('role=figure와 aria-label을 설정하고 Provider 값을 주입한다', () => {
    render(
      <ChartRoot config={{}} data={[]} aria-label="테스트 차트">
        <ConfigProbe />
      </ChartRoot>,
    );

    const figure = screen.getByRole('figure', { name: '테스트 차트' });
    expect(figure).toBeInTheDocument();
    expect(screen.getByText('size:large')).toBeInTheDocument();
  });

  it('legend=right일 때 가로 배치 클래스를 적용한다', () => {
    render(
      <ChartRoot config={{}} data={[]} legend="right" aria-label="차트">
        <span>plot</span>
      </ChartRoot>,
    );

    expect(screen.getByRole('figure')).toHaveClass('flex-row', 'items-center');
  });

  it('size를 명시하면 그대로 쓴다', () => {
    render(
      <ChartRoot config={{}} data={[]} size="small" aria-label="차트">
        <ConfigProbe />
      </ChartRoot>,
    );

    expect(screen.getByText('size:small')).toBeInTheDocument();
  });
});
