import type { ComponentType, ReactNode } from 'react';

type ChartTheme = 'light' | 'dark';

type ChartConfig = Record<
  string,
  {
    label?: ReactNode;
    icon?: ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<ChartTheme, string> }
  )
>;

interface ChartConfigContextValue {
  config: ChartConfig;
}

interface ChartConfigProviderProps extends ChartConfigContextValue {
  children: ReactNode;
}

type ChartSize = 'large' | 'small';

interface ChartContextValue {
  config: ChartConfig;
  data: Record<string, unknown>[];
  valueKey?: string;
  size: ChartSize;
  isEmpty: boolean;
  total: number;
}

interface ChartProviderProps extends Pick<
  ChartContextValue,
  'config' | 'data' | 'valueKey' | 'size'
> {
  children: ReactNode;
}

export type {
  ChartConfig,
  ChartConfigContextValue,
  ChartConfigProviderProps,
  ChartContextValue,
  ChartProviderProps,
  ChartSize,
  ChartTheme,
};
