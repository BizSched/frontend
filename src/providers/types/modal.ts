import type { ReactNode } from 'react';

interface ModalContextValue {
  stackIndex: number;
}

interface ModalProviderProps extends ModalContextValue {
  children: ReactNode;
}

export type { ModalContextValue, ModalProviderProps };
