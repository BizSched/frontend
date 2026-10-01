'use client';

import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { useChartContext } from '@hooks/chart/useChartContext';
import { useChartSeries } from '@hooks/chart/useChartSeries';

import { cn } from '@lib/utilities/cn';

const chartSeriesLegendVariants = cva(
  'flex flex-wrap items-center gap-2.5 font-medium',
  {
    variants: {
      size: {
        large: 'text-base',
        small: 'text-[0.625rem] leading-3',
      },
    },
  },
);

type ChartSeriesLegendProps = ComponentProps<'ul'>;

function ChartSeriesLegend({ className, ...props }: ChartSeriesLegendProps) {
  const { config, isEmpty, size } = useChartContext();
  const series = useChartSeries(config);

  if (isEmpty) {
    return null;
  }

  return (
    <ul
      data-slot="chart-legend"
      className={cn(chartSeriesLegendVariants({ size }), className)}
      {...props}
    >
      {series.map(({ key, label, color }) => (
        <li key={key} className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="size-3 shrink-0 rounded-[2px]"
            style={{ backgroundColor: color }}
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

export { ChartSeriesLegend };
