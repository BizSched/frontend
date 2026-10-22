'use client';

import { PlusIcon } from 'lucide-react';

import { Button } from '@components/_common/Button/Button';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';

function PartTimeScheduleAddButton() {
  const handleClick = () => {
    void openPartTimeScheduleFormModal({ mode: 'create' });
  };

  return (
    <Button
      size="small"
      icon={<PlusIcon size={20} strokeWidth={1.5} />}
      onClick={handleClick}
    >
      스케줄 추가
    </Button>
  );
}

export { PartTimeScheduleAddButton };
