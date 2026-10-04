'use client';

import { LinkIcon, PencilIcon } from 'lucide-react';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';
import { ACTIVE_PART_TIME_STAFFS } from '@components/partTime/schedule/partTimeScheduleMock';

function PartTimeScheduleActionButtons() {
  const handleScheduleAdd = () => {
    void openPartTimeScheduleFormModal({
      mode: 'create',
      staffs: ACTIVE_PART_TIME_STAFFS,
    });
  };

  return (
    <div className="fixed right-3 bottom-3 z-20 hidden max-mobile:flex">
      <ActionButton
        aria-label="스케쥴 액션 열기"
        actions={[
          { icon: <LinkIcon />, label: '스케쥴 공유', onClick: () => {} },
          {
            icon: <PencilIcon />,
            label: '스케쥴 추가',
            onClick: handleScheduleAdd,
          },
        ]}
      />
    </div>
  );
}

export { PartTimeScheduleActionButtons };
