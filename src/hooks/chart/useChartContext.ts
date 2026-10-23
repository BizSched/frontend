'use client';

import { useContext } from 'react';

import { ChartContext } from '@providers/chart/ChartProvider';

const useChartContext = () => {
  const context = useContext(ChartContext);

  if (!context) {
    throw new Error('useChartContext must be used within a <Chart>');
  }

  return context;
};

export { useChartContext };
