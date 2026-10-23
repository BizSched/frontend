'use client';

import { createContext } from 'react';

import type {
  ChartConfigContextValue,
  ChartConfigProviderProps,
} from '@providers/types/chart';

const ChartConfigContext = createContext<ChartConfigContextValue | null>(null);

function ChartConfigProvider({ config, children }: ChartConfigProviderProps) {
  return (
    <ChartConfigContext.Provider value={{ config }}>
      {children}
    </ChartConfigContext.Provider>
  );
}

export { ChartConfigContext, ChartConfigProvider };
