import { CalendarEventChip } from '@components/_common/Calendar/CalendarEventChip';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const QUICK_TIME_RANGES = [
  { label: '오전', startTime: '09:00', endTime: '13:00' },
  { label: '오후', startTime: '13:00', endTime: '18:00' },
  { label: '저녁', startTime: '18:00', endTime: '22:00' },
] as const;

interface PartTimeScheduleQuickTimeSelectProps {
  startTime?: string;
  endTime?: string;
  onSelect: (startTime: string, endTime: string) => void;
  isDisabled?: boolean;
}

function PartTimeScheduleQuickTimeSelect({
  startTime,
  endTime,
  onSelect,
  isDisabled = false,
}: PartTimeScheduleQuickTimeSelectProps) {
  return (
    <fieldset
      disabled={isDisabled}
      className="flex min-w-0 flex-wrap gap-2.5 disabled:opacity-50 max-tablet:gap-1"
    >
      {QUICK_TIME_RANGES.map((range) => {
        const isSelected =
          range.startTime === startTime && range.endTime === endTime;

        return (
          <CalendarEventChip
            key={range.label}
            label={`${range.label} (${range.startTime} ~ ${range.endTime})`}
            tone={isSelected ? 'accent' : 'muted'}
            onClick={() => {
              if (!isDisabled) onSelect(range.startTime, range.endTime);
            }}
            className={cn(typographyVariants({ role: 'label' }))}
          />
        );
      })}
    </fieldset>
  );
}

export { PartTimeScheduleQuickTimeSelect };
