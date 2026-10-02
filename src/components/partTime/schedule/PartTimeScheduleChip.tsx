import Image from 'next/image';

import { CalendarEventChip } from '@components/_common/Calendar/CalendarEventChip';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

import IcCheckbox from '@assets/icons/ic_checkbox.svg';

interface PartTimeScheduleChipProps {
  schedule: PartTimeSchedule;
}

function PartTimeScheduleChip({ schedule }: PartTimeScheduleChipProps) {
  const { staff, isCheckedIn } = schedule;

  return (
    <CalendarEventChip
      label={staff.name}
      tone={isCheckedIn ? 'muted' : 'accent'}
      leadingSlot={
        isCheckedIn && (
          <Image
            src={IcCheckbox}
            alt="완료"
            width={16}
            height={16}
            unoptimized
          />
        )
      }
    />
  );
}

export { PartTimeScheduleChip };
