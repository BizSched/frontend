import { DayButton as DayPickerDayButton } from 'react-day-picker';
import type { DayButtonProps } from 'react-day-picker';

import { cn } from '@lib/utilities/cn';

function CalendarDayButton({
  className,
  children,
  modifiers,
  ...props
}: DayButtonProps) {
  return (
    <DayPickerDayButton
      className={cn(
        'max-tablet:p-1.5 absolute inset-0 flex cursor-pointer items-start justify-start p-2 text-xs leading-4 text-slate-400 outline-none',
        'focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-slate-500',
        className,
      )}
      modifiers={modifiers}
      {...props}
    >
      <span
        className={cn(
          'flex size-6 items-center justify-center rounded-full',
          modifiers.today && 'bg-primary-500 text-white-50',
        )}
      >
        {children}
      </span>
    </DayPickerDayButton>
  );
}

export { CalendarDayButton };
