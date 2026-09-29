'use client';

import { useSyncExternalStore } from 'react';

type PaginationSize = 'lg' | 'sm';

const PAGINATION_BREAKPOINT = '(width < 46.5rem)';

const subscribe = (onStoreChange: () => void) => {
  const mediaQueryList = window.matchMedia(PAGINATION_BREAKPOINT);

  mediaQueryList.addEventListener('change', onStoreChange);

  return () => mediaQueryList.removeEventListener('change', onStoreChange);
};

const getSnapshot = (): PaginationSize =>
  window.matchMedia(PAGINATION_BREAKPOINT).matches ? 'sm' : 'lg';

const getServerSnapshot = (): PaginationSize => 'lg';

const usePaginationSize = (size?: PaginationSize): PaginationSize => {
  const detectedSize = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return size ?? detectedSize;
};

export { usePaginationSize, PAGINATION_BREAKPOINT };
export type { PaginationSize };
