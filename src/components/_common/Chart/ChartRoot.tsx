'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { useChartSize } from '@hooks/chart/useChartSize';

import { ChartProvider } from '@providers/chart/ChartProvider';
import type { ChartSeriesConfig, ChartSize } from '@providers/types/chart';

import { cn } from '@lib/utilities/cn';

const chartRootVariants = cva('flex gap-2.5', {
  variants: {
    legend: {
      bottom: 'flex-col',
      right:
        'flex-row items-center [&_[data-slot=chart-legend]]:flex-col [&_[data-slot=chart-legend]]:items-start',
    },
  },
  defaultVariants: {
    legend: 'bottom',
  },
});

interface ChartRootProps
  extends
    Omit<ComponentProps<'div'>, 'children'>,
    VariantProps<typeof chartRootVariants> {
  // NOTE: <Chart> 트리는 Client Component 안에서 조합한다. Server Component에서는 Chart가 client reference라
  // <Chart.Plot> 같은 점 접근이 런타임 에러가 나고, config.icon(ComponentType) 같은 함수 값도 직렬화되지 않는다.
  config: ChartSeriesConfig;
  data: Record<string, unknown>[];
  valueKey?: string;
  size?: ChartSize;
  'aria-label': string;
  children: ReactNode;
}

function ChartRoot({
  config,
  data,
  valueKey,
  size,
  legend,
  className,
  children,
  ...props
}: ChartRootProps) {
  const resolvedSize = useChartSize(size);

  return (
    <div
      data-slot="chart-root"
      role="figure"
      className={cn(chartRootVariants({ legend }), className)}
      {...props}
    >
      <ChartProvider
        config={config}
        data={data}
        valueKey={valueKey}
        size={resolvedSize}
      >
        {children}
      </ChartProvider>
    </div>
  );
}

export { ChartRoot };
