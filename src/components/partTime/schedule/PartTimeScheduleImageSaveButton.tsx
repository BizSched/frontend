'use client';

import { ImageDownIcon } from 'lucide-react';

import { Button } from '@components/_common/Button/Button';

import { usePartTimeScheduleImage } from '@hooks/partTime/usePartTimeScheduleImage';

function PartTimeScheduleImageSaveButton() {
  const { isReady, isSaving, saveImage } = usePartTimeScheduleImage();

  return (
    <Button
      hierarchy="secondary"
      size="small"
      icon={<ImageDownIcon strokeWidth={1.8} aria-hidden="true" />}
      className="text-accent-500 [&_svg]:size-5"
      disabled={!isReady || isSaving}
      focusableWhenDisabled
      aria-busy={isSaving}
      onClick={() => {
        void saveImage();
      }}
    >
      {isSaving ? '저장 중…' : '이미지 저장'}
    </Button>
  );
}

export { PartTimeScheduleImageSaveButton };
