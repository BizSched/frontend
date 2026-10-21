'use client';

import { LinkIcon, PencilIcon } from 'lucide-react';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';

function PartTimeScheduleActionButtons() {
  const handleScheduleAdd = () => {
    void openPartTimeScheduleFormModal({ mode: 'create' });
  };

  return (
    <div className="fixed right-3 bottom-3 z-20 hidden max-mobile:flex">
      <ActionButton
        aria-label="스케줄 액션 열기"
        actions={[
          { icon: <LinkIcon />, label: '스케줄 공유', onClick: () => {} },
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
