'use client';

import Image from 'next/image';

import { Button } from '@components/_common/Button/Button';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';
import { ACTIVE_PART_TIME_STAFFS } from '@components/partTime/schedule/partTimeScheduleMock';

import IcPlusWhite from '@assets/icons/ic_plus-white.svg';

function PartTimeScheduleAddButton() {
  const handleClick = () => {
    void openPartTimeScheduleFormModal({
      mode: 'create',
      staffs: ACTIVE_PART_TIME_STAFFS,
    });
  };

  return (
    <Button
      size="small"
      icon={
        <Image src={IcPlusWhite} alt="" width={20} height={20} unoptimized />
      }
      className="h-10 w-auto min-w-30 py-2.5"
      onClick={handleClick}
    >
      스케쥴 추가
    </Button>
  );
}

export { PartTimeScheduleAddButton };
