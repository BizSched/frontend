import type { ChartConfig } from '@providers/types/chart';

interface ChartSeriesItem {
  key: string;
  label: ChartConfig[string]['label'];
  color?: string;
}

const useChartSeries = (config: ChartConfig): ChartSeriesItem[] =>
  Object.entries(config).map(([key, itemConfig]) => ({
    key,
    label: itemConfig.label,
    color: itemConfig.color,
  }));

export { useChartSeries };
export type { ChartSeriesItem };
