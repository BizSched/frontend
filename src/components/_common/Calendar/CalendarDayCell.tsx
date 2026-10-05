import { createContext, useContext, type ReactNode } from 'react';
import { Day as DayPickerDay } from 'react-day-picker';
import type { DayProps } from 'react-day-picker';

import { cn } from '@lib/utilities/cn';

interface CalendarDayContent {
  full: ReactNode;
  compact: ReactNode;
  totalCount: number;
}

interface CalendarDayCellContextValue {
  contentByDate: Record<string, CalendarDayContent>;
  onDateSelect: (date: string) => void;
}

const CalendarDayCellContext =
  createContext<CalendarDayCellContextValue | null>(null);

interface CalendarDayCellProviderProps extends CalendarDayCellContextValue {
  children: ReactNode;
}

function CalendarDayCellProvider({
  contentByDate,
  onDateSelect,
  children,
}: CalendarDayCellProviderProps) {
  return (
    <CalendarDayCellContext.Provider value={{ contentByDate, onDateSelect }}>
      {children}
    </CalendarDayCellContext.Provider>
  );
}

function CalendarDayCell({
  day,
  modifiers,
  children,
  className,
  ...props
}: DayProps) {
  const context = useContext(CalendarDayCellContext);
  const content = context?.contentByDate[day.isoDate];
  const overflowCount = Math.max((content?.totalCount ?? 0) - 3, 0);

  const handleMoreClick = () => {
    context?.onDateSelect(day.isoDate);
  };

  return (
    <DayPickerDay
      day={day}
      modifiers={modifiers}
      className={cn(className)}
      {...props}
    >
      {children}
      {content && (
        <div className="max-tablet:mt-7 max-tablet:px-1.5 pointer-events-none relative z-10 mt-8 flex min-w-0 flex-col gap-1 px-2">
          <div className="max-tablet:hidden pointer-events-auto flex min-w-0 flex-col gap-1">
            {content.full}
          </div>
          <div className="max-tablet:flex pointer-events-auto hidden min-w-0 items-center">
            {content.compact}
          </div>
          {overflowCount > 0 && (
            <button
              type="button"
              className="pointer-events-auto w-fit cursor-pointer rounded-sm text-xs leading-4 text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1"
              aria-label={`${day.isoDate}의 일정 ${overflowCount}개 더 보기`}
              onClick={handleMoreClick}
            >
              +{overflowCount}
            </button>
          )}
        </div>
      )}
    </DayPickerDay>
  );
}

export { CalendarDayCell, CalendarDayCellProvider };
export type { CalendarDayContent };
