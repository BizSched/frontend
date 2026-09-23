'use client';

import { OverlayProvider as OverlayKitProvider } from 'overlay-kit';

import type { OverlayProviderProps } from '@providers/types/overlay';

function OverlayProvider({ children }: OverlayProviderProps) {
  return <OverlayKitProvider>{children}</OverlayKitProvider>;
}

export { OverlayProvider };
