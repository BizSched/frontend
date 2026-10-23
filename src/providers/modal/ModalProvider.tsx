'use client';

import { createContext, useMemo } from 'react';

import type {
  ModalContextValue,
  ModalProviderProps,
} from '@providers/types/modal';

const ModalContext = createContext<ModalContextValue | null>(null);

function ModalProvider({ stackIndex, children }: ModalProviderProps) {
  const value = useMemo(() => ({ stackIndex }), [stackIndex]);

  return <ModalContext value={value}>{children}</ModalContext>;
}

export { ModalContext, ModalProvider };
