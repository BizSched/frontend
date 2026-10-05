import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useChartContext } from '@hooks/chart/useChartContext';

describe('useChartContext', () => {
  it('Provider 밖에서 호출하면 throw한다', () => {
    function Broken() {
      useChartContext();
      return null;
    }

    expect(() => render(<Broken />)).toThrow(
      'useChartContext must be used within a <Chart>',
    );
  });
});
