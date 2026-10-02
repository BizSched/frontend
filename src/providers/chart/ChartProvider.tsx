'use client';

import { createContext } from 'react';

import { useChartSummary } from '@hooks/chart/useChartSummary';

import type {
  ChartContextValue,
  ChartProviderProps,
} from '@providers/types/chart';

const ChartContext = createContext<ChartContextValue | null>(null);

function ChartProvider({
  config,
  data,
  valueKey,
  size,
  children,
}: ChartProviderProps) {
  const { total, isEmpty } = useChartSummary(data, config, valueKey);

  return (
    <ChartContext.Provider
      value={{ config, data, valueKey, size, isEmpty, total }}
    >
      {children}
    </ChartContext.Provider>
  );
}

export { ChartContext, ChartProvider };
