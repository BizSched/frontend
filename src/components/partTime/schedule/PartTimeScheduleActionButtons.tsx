'use client';

import { ImageDownIcon, PencilIcon } from 'lucide-react';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';

import { usePartTimeScheduleImage } from '@hooks/partTime/usePartTimeScheduleImage';

function PartTimeScheduleActionButtons() {
  const { isReady, isSaving, saveImage } = usePartTimeScheduleImage();

  const handleImageSave = () => {
    void saveImage();
  };

  const handleScheduleAdd = () => {
    void openPartTimeScheduleFormModal({ mode: 'create' });
  };

  return (
    <div className="fixed right-3 bottom-3 z-20 hidden max-mobile:flex">
      <ActionButton
        aria-label="스케줄 액션 열기"
        actions={[
          {
            icon: <ImageDownIcon />,
            label: isSaving ? '저장 중…' : '이미지 저장',
            onClick: handleImageSave,
            isDisabled: !isReady || isSaving,
          },
          {
            icon: <PencilIcon />,
            label: '스케줄 추가',
            onClick: handleScheduleAdd,
          },
        ]}
      />
    </div>
  );
}

export { PartTimeScheduleActionButtons };
