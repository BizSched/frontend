'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

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
  // NOTE: ChartRoot는 client component라 Server Component에서 직접 렌더하면 config가 직렬화된다.
  // config.icon(ComponentType) 같은 함수는 직렬화할 수 없으므로, API 연동 시 차트를 렌더하는 위치(client 도메인 컴포넌트 안)를 함께 정한다.
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
  const resolvedSize = size ?? 'large';

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
