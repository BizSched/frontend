'use client';

import { useOverlayData } from 'overlay-kit';

const useOverlayStackIndex = (overlayId?: string) => {
  const overlayData = useOverlayData();

  if (overlayId == null) {
    return 0;
  }

  const index = Object.keys(overlayData).indexOf(overlayId);

  return index < 0 ? 0 : index;
};

export { useOverlayStackIndex };
