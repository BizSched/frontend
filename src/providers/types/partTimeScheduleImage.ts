import type { ReactNode } from 'react';

interface PartTimeScheduleImageTarget {
  element: HTMLElement | null;
  fileName: string;
  isReady: boolean;
}

interface PartTimeScheduleImageContextValue {
  isReady: boolean;
  isSaving: boolean;
  saveImage: () => Promise<void>;
  registerTarget: (getTarget: () => PartTimeScheduleImageTarget) => () => void;
}

interface PartTimeScheduleImageProviderProps {
  children: ReactNode;
}

export type {
  PartTimeScheduleImageContextValue,
  PartTimeScheduleImageProviderProps,
  PartTimeScheduleImageTarget,
};
