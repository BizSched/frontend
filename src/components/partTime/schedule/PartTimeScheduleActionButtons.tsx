'use client';

import { LinkIcon, PencilIcon } from 'lucide-react';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';

function PartTimeScheduleActionButtons() {
  return (
    <div className="fixed right-3 bottom-3 z-20 hidden max-mobile:flex">
      <ActionButton
        aria-label="스케쥴 액션 열기"
        actions={[
          { icon: <LinkIcon />, label: '스케쥴 공유', onClick: () => {} },
          { icon: <PencilIcon />, label: '스케쥴 추가', onClick: () => {} },
        ]}
      />
    </div>
  );
}

export { PartTimeScheduleActionButtons };
