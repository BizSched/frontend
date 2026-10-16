'use client';

import Image from 'next/image';

import { Button } from '@components/_common/Button/Button';
import { openPartTimeScheduleFormModal } from '@components/partTime/schedule/modal/openPartTimeScheduleFormModal';

import IcPlusWhite from '@assets/icons/ic_plus-white.svg';

function PartTimeScheduleAddButton() {
  const handleClick = () => {
    void openPartTimeScheduleFormModal({ mode: 'create' });
  };

  return (
    <Button
      size="small"
      icon={
        <Image src={IcPlusWhite} alt="" width={20} height={20} unoptimized />
      }
      onClick={handleClick}
    >
      스케쥴 추가
    </Button>
  );
}

export { PartTimeScheduleAddButton };
