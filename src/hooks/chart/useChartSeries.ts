import type { ChartSeriesConfig } from '@providers/types/chart';

interface ChartSeriesItem {
  key: string;
  label: ChartSeriesConfig[string]['label'];
  color: string;
}

const useChartSeries = (config: ChartSeriesConfig): ChartSeriesItem[] =>
  Object.entries(config).map(([key, itemConfig]) => ({
    key,
    label: itemConfig.label,
    color: itemConfig.color,
  }));

export { useChartSeries };
export type { ChartSeriesItem };
