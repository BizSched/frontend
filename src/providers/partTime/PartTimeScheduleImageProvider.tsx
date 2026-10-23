'use client';

import { createContext, useCallback, useMemo, useRef, useState } from 'react';

import { toast } from '@components/_common/Toast/Toaster';

import type {
  PartTimeScheduleImageContextValue,
  PartTimeScheduleImageProviderProps,
  PartTimeScheduleImageTarget,
} from '@providers/types/partTimeScheduleImage';

import { captureElementImage } from '@lib/utilities/capture/captureElementImage';
import { downloadBlob } from '@lib/utilities/capture/downloadBlob';

const IMAGE_PADDING_PX = 48;
const IMAGE_ERROR_TOAST_ID = 'schedule-image-error';
const IMAGE_ERROR_MESSAGE = '이미지를 저장하지 못했어요. 다시 시도해주세요.';

const PartTimeScheduleImageContext =
  createContext<PartTimeScheduleImageContextValue | null>(null);

function PartTimeScheduleImageProvider({
  children,
}: PartTimeScheduleImageProviderProps) {
  const getTargetRef = useRef<(() => PartTimeScheduleImageTarget) | null>(null);
  const isSavingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const registerTarget = useCallback(
    (getTarget: () => PartTimeScheduleImageTarget) => {
      getTargetRef.current = getTarget;
      setIsReady(getTarget().isReady);
      return () => {
        if (getTargetRef.current === getTarget) {
          getTargetRef.current = null;
          setIsReady(false);
        }
      };
    },
    [],
  );

  const saveImage = useCallback(async () => {
    const target = getTargetRef.current?.();
    if (!target?.element || !target.isReady || isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    toast.dismiss(IMAGE_ERROR_TOAST_ID);
    try {
      const blob = await captureElementImage(target.element, IMAGE_PADDING_PX);
      downloadBlob(blob, target.fileName);
    } catch {
      toast.error(IMAGE_ERROR_MESSAGE, { id: IMAGE_ERROR_TOAST_ID });
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  }, []);

  const value = useMemo(
    () => ({ isReady, isSaving, saveImage, registerTarget }),
    [isReady, isSaving, saveImage, registerTarget],
  );

  return (
    <PartTimeScheduleImageContext.Provider value={value}>
      {children}
    </PartTimeScheduleImageContext.Provider>
  );
}

export { PartTimeScheduleImageContext, PartTimeScheduleImageProvider };
