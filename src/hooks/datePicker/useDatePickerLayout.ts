'use client';

import { useSyncExternalStore } from 'react';

type DatePickerLayout = 'popover' | 'sheet';

const DATE_PICKER_SHEET_BREAKPOINT = '(width < 46.5rem)';

const subscribe = (onStoreChange: () => void) => {
  const mediaQueryList = window.matchMedia(DATE_PICKER_SHEET_BREAKPOINT);

  mediaQueryList.addEventListener('change', onStoreChange);

  return () => mediaQueryList.removeEventListener('change', onStoreChange);
};

const getSnapshot = (): DatePickerLayout =>
  window.matchMedia(DATE_PICKER_SHEET_BREAKPOINT).matches ? 'sheet' : 'popover';

const getServerSnapshot = (): DatePickerLayout => 'popover';

const useDatePickerLayout = (): DatePickerLayout =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export { useDatePickerLayout, DATE_PICKER_SHEET_BREAKPOINT };
export type { DatePickerLayout };
