'use client';

import { useId, type ComponentProps } from 'react';
import { ResponsiveContainer } from 'recharts';

import { ChartConfigProvider } from '@providers/chart/ChartConfigProvider';
import type { ChartConfig } from '@providers/types/chart';

import { cn } from '@lib/utilities/cn';

import { ChartStyle } from './ChartStyle';

const CHART_INITIAL_DIMENSION = { width: 320, height: 200 } as const;

interface ChartContainerProps extends ComponentProps<'div'> {
  config: ChartConfig;
  children: ComponentProps<typeof ResponsiveContainer>['children'];
  initialDimension?: { width: number; height: number };
}

function ChartContainer({
  id,
  className,
  children,
  config,
  initialDimension = CHART_INITIAL_DIMENSION,
  ...props
}: ChartContainerProps) {
  const uniqueId = useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, '')}`;

  return (
    <ChartConfigProvider config={config}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer initialDimension={initialDimension}>
          {children}
        </ResponsiveContainer>
      </div>
    </ChartConfigProvider>
  );
}

export { ChartContainer };
