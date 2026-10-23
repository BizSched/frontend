'use client';

import { useContext } from 'react';

import { ChartConfigContext } from '@providers/chart/ChartConfigProvider';

const useChartConfig = () => {
  const context = useContext(ChartConfigContext);

  if (!context) {
    throw new Error('useChartConfig must be used within a <ChartContainer />');
  }

  return context;
};

export { useChartConfig };
