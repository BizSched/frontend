'use client';

import { ChartBar } from './ChartBar';
import { ChartCenter } from './ChartCenter';
import { ChartDonut } from './ChartDonut';
import { ChartEmpty } from './ChartEmpty';
import { ChartPlot } from './ChartPlot';
import { ChartRoot } from './ChartRoot';
import { ChartSeriesLegend } from './ChartSeriesLegend';

const Chart = Object.assign(ChartRoot, {
  Plot: ChartPlot,
  Bar: ChartBar,
  Donut: ChartDonut,
  Center: ChartCenter,
  Legend: ChartSeriesLegend,
  Empty: ChartEmpty,
});

export { Chart };
