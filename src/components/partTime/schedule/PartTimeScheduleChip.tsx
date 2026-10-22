import { CheckIcon } from 'lucide-react';

import { CalendarEventChip } from '@components/_common/Calendar/CalendarEventChip';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

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
          <CheckIcon aria-label="완료" size={16} className="text-[#A4A4A4]" />
        )
      }
    />
  );
}

export { PartTimeScheduleChip };
