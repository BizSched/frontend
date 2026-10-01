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

  // 타입 계약 테스트: pnpm type-check가 검증한다. 슬롯은 color만 읽으므로
  // theme 형태 config는 색이 사라진 채 렌더된다. 타입에서 막혀야 한다.
  it('색은 theme이 아니라 color로만 받는다', () => {
    render(
      <ChartRoot
        // @ts-expect-error compound Chart는 theme 형태 config를 지원하지 않는다
        config={{ a: { label: 'A', theme: { light: 'red', dark: 'blue' } } }}
        data={[]}
        aria-label="차트"
      >
        <span />
      </ChartRoot>,
    );

    expect(screen.getByRole('figure')).toBeInTheDocument();
  });

  it('플롯과 범례 사이 간격은 size와 관계없이 10px이다', () => {
    render(
      <ChartRoot config={{}} data={[]} size="small" aria-label="차트">
        <span>plot</span>
      </ChartRoot>,
    );

    expect(screen.getByRole('figure')).toHaveClass('gap-2.5');
  });

  it('legend=right일 때 가로 배치 클래스를 적용한다', () => {
    render(
      <ChartRoot config={{}} data={[]} legend="right" aria-label="차트">
        <span>plot</span>
      </ChartRoot>,
    );

    expect(screen.getByRole('figure')).toHaveClass(
      'flex-row',
      'items-center',
      '[&_[data-slot=chart-legend]]:flex-col',
      '[&_[data-slot=chart-legend]]:items-start',
    );
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
