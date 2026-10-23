'use client';

import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

type ChartPlotProps = ComponentProps<'div'>;

function ChartPlot({ className, ...props }: ChartPlotProps) {
  return (
    <div
      data-slot="chart-plot"
      className={cn('relative', className)}
      {...props}
    />
  );
}

export { ChartPlot };
