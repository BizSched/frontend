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

// compound Chart 전용. 슬롯(Bar·Donut·Legend)이 색을 직접 주입하므로 color가 필수이고,
// shadcn ChartStyle의 CSS 변수(--color-<key>)에 의존하는 theme 형태는 받지 않는다.
type ChartSeriesConfig = Record<
  string,
  {
    label?: ReactNode;
    icon?: ComponentType;
    color: string;
  }
>;

interface ChartConfigContextValue {
  config: ChartConfig;
}

interface ChartConfigProviderProps extends ChartConfigContextValue {
  children: ReactNode;
}

type ChartSize = 'large' | 'small';

interface ChartContextValue {
  config: ChartSeriesConfig;
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
  ChartSeriesConfig,
  ChartSize,
  ChartTheme,
};
