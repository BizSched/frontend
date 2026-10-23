import type { ChartSeriesConfig } from '@providers/types/chart';

interface ChartSummary {
  total: number;
  isEmpty: boolean;
}

const useChartSummary = (
  data: Record<string, unknown>[],
  config: ChartSeriesConfig,
  valueKey?: string,
): ChartSummary => {
  if (data.length === 0) {
    return { total: 0, isEmpty: true };
  }

  const total = valueKey
    ? data.reduce((sum, row) => sum + Number(row[valueKey] ?? 0), 0)
    : data.reduce(
        (sum, row) =>
          sum +
          Object.keys(config).reduce(
            (rowSum, key) => rowSum + Number(row[key] ?? 0),
            0,
          ),
        0,
      );

  return { total, isEmpty: total === 0 };
};

export { useChartSummary };
export type { ChartSummary };
