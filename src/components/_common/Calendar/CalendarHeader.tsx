import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { formatCalendarMonthLabel } from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';

interface CalendarHeaderProps {
  month: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  headerSlot?: ReactNode;
}

function CalendarHeader({
  month,
  onPreviousMonth,
  onNextMonth,
  headerSlot,
}: CalendarHeaderProps) {
  const navigation = (
    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="이전 달"
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        onClick={onPreviousMonth}
      >
        <ChevronsLeftIcon aria-hidden="true" className="size-6" />
      </button>
      <p
        aria-live="polite"
        className="min-w-[7.5rem] text-center text-lg leading-7 font-semibold tracking-[-0.03em] text-slate-500"
      >
        {formatCalendarMonthLabel(month)}
      </p>
      <button
        type="button"
        aria-label="다음 달"
        className="flex size-6 cursor-pointer items-center justify-center rounded-full text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
        onClick={onNextMonth}
      >
        <ChevronsRightIcon aria-hidden="true" className="size-6" />
      </button>
    </div>
  );

  return (
    <header
      className={cn(
        'max-tablet:px-4 flex items-center px-8 py-5',
        headerSlot &&
          'max-tablet:flex-col max-tablet:items-stretch justify-between gap-4',
        !headerSlot && 'justify-center',
        'max-mobile:py-6',
      )}
    >
      {navigation}
      {headerSlot}
    </header>
  );
}

export { CalendarHeader };
export type { CalendarHeaderProps };
