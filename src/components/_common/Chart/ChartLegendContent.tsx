'use client';

import type { ComponentProps } from 'react';
import type { DefaultLegendContentProps } from 'recharts';

import { useChartConfig } from '@hooks/chart/useChartConfig';

import { getPayloadConfigFromPayload } from '@lib/utilities/chart/getPayloadConfigFromPayload';
import { cn } from '@lib/utilities/cn';

type ChartLegendContentProps = ComponentProps<'div'> &
  DefaultLegendContentProps & {
    hideIcon?: boolean;
    nameKey?: string;
  };

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = 'bottom',
  nameKey,
}: ChartLegendContentProps) {
  const { config } = useChartConfig();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex items-center justify-start gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload
        .filter((item) => item.type !== 'none')
        .map((item, index) => {
          const key = `${nameKey ?? item.dataKey ?? 'value'}`;
          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          return (
            <div
              key={index}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            >
              {itemConfig?.icon && !hideIcon ? (
                <itemConfig.icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
              )}
              {itemConfig?.label}
            </div>
          );
        })}
    </div>
  );
}

export { ChartLegendContent };
