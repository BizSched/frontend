'use client';

import { cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { useChartContext } from '@hooks/chart/useChartContext';

import { cn } from '@lib/utilities/cn';

const chartCenterTextVariants = cva('font-bold text-foreground', {
  variants: {
    size: {
      large: 'text-base',
      small: 'text-[0.625rem] leading-3',
    },
  },
});

interface ChartCenterProps extends ComponentProps<'div'> {
  label: string;
  value: string;
}

function ChartCenter({ label, value, className, ...props }: ChartCenterProps) {
  const { size } = useChartContext();
  const textClassName = chartCenterTextVariants({ size });

  return (
    <div
      data-slot="chart-center"
      className={cn(
        'pointer-events-none absolute inset-0 flex flex-col items-center justify-center',
        className,
      )}
      {...props}
    >
      <span className={textClassName}>{label}</span>
      <span className={textClassName}>{value}</span>
    </div>
  );
}

export { ChartCenter };
