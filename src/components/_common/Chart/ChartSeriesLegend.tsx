'use client';

import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { useChartContext } from '@hooks/chart/useChartContext';
import { useChartSeries } from '@hooks/chart/useChartSeries';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const chartSeriesLegendVariants = cva('flex flex-wrap items-center', {
  variants: {
    size: {
      large: cn(typographyVariants({ role: 'supporting' }), 'gap-4'),
      small: cn(typographyVariants({ role: 'supporting' }), 'gap-2.5'),
    },
  },
});

const chartSeriesLegendChipVariants = cva('shrink-0', {
  variants: {
    size: {
      large: 'size-2.5 rounded-[3px]',
      small: 'size-2 rounded-[2px]',
    },
  },
});

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
        <li key={key} className="flex items-center gap-1">
          <span
            aria-hidden="true"
            className={chartSeriesLegendChipVariants({ size })}
            style={{ backgroundColor: color }}
          />
          {label}
        </li>
      ))}
    </ul>
  );
}

export { ChartSeriesLegend };
