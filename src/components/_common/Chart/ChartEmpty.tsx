'use client';

import type { ReactNode } from 'react';

import { useChartContext } from '@hooks/chart/useChartContext';

interface ChartEmptyProps {
  children: ReactNode;
}

function ChartEmpty({ children }: ChartEmptyProps) {
  const { isEmpty } = useChartContext();

  if (!isEmpty) {
    return null;
  }

  return <>{children}</>;
}

export { ChartEmpty };
