'use client';

import { createContext } from 'react';

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
  const isEmpty = data.length === 0;
  const total = 0;

  return (
    <ChartContext.Provider
      value={{ config, data, valueKey, size, isEmpty, total }}
    >
      {children}
    </ChartContext.Provider>
  );
}

export { ChartContext, ChartProvider };
