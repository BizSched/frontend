'use client';

import { useSyncExternalStore } from 'react';

import type { ChartSize } from '@providers/types/chart';

const CHART_BREAKPOINT = '(width < 46.5rem)';

// jsdom 등 matchMedia가 없는 환경에서는 null을 반환해 large로 폴백한다.
const getMediaQueryList = () =>
  typeof window.matchMedia === 'function'
    ? window.matchMedia(CHART_BREAKPOINT)
    : null;

const subscribe = (onStoreChange: () => void) => {
  const mediaQueryList = getMediaQueryList();

  mediaQueryList?.addEventListener('change', onStoreChange);

  return () => mediaQueryList?.removeEventListener('change', onStoreChange);
};

const getSnapshot = (): ChartSize =>
  getMediaQueryList()?.matches ? 'small' : 'large';

const getServerSnapshot = (): ChartSize => 'large';

const useChartSize = (size?: ChartSize): ChartSize => {
  const detectedSize = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return size ?? detectedSize;
};

export { CHART_BREAKPOINT, useChartSize };
