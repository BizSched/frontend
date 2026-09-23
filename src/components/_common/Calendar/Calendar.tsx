'use client';

import { cva } from 'class-variance-authority';
import { addMonths } from 'date-fns';
import type { ReactNode } from 'react';
import {
  DayButton,
  type DayButtonProps,
  type WeekdaysProps,
} from 'react-day-picker';
import { ko } from 'react-day-picker/locale';

import { CalendarHeader } from '@components/_common/Calendar/CalendarHeader';
import { Calendar as CalendarPrimitive } from '@components/_common/ui/calendar';

import {
  CALENDAR_TIME_ZONE,
  formatCalendarDate,
  formatCalendarMonth,
  toCalendarDate,
  toCalendarMonth,
} from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';

interface CalendarProps {
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
  today: string;
  headerSlot?: ReactNode;
  label?: string;
  className?: string;
}

const calendarDateVariants = cva(
  'flex size-6 items-center justify-center text-xs',
  {
    variants: {
      isToday: {
        true: 'rounded-full bg-primary-500 text-slate-500',
        false: 'text-slate-400',
      },
    },
  },
);

function CalendarDateButton({ children, modifiers, ...props }: DayButtonProps) {
  return (
    <DayButton
      modifiers={modifiers}
      {...props}
      aria-current={modifiers.today ? 'date' : undefined}
    >
      <span className={calendarDateVariants({ isToday: !!modifiers.today })}>
        {children}
      </span>
    </DayButton>
  );
}

function CalendarWeekdays(props: WeekdaysProps) {
  return (
    <thead>
      <tr {...props} />
    </thead>
  );
}

function CalendarHiddenCaption() {
  return <></>;
}

function Calendar({
  selectedDate,
  onDateChange,
  month,
  onMonthChange,
  today,
  headerSlot,
  label = '캘린더',
  className,
}: CalendarProps) {
  const displayedMonth = toCalendarMonth(month);
  const selected =
    selectedDate === null ? undefined : toCalendarDate(selectedDate);
  const currentDate = toCalendarDate(today);

  const handleMonthChange = (date: Date) => {
    const nextMonth = formatCalendarMonth(date);
    if (nextMonth !== month) onMonthChange(nextMonth);
  };

  const handleDateChange = (date: Date) => {
    const nextDate = formatCalendarDate(date);
    if (nextDate !== selectedDate) onDateChange(nextDate);
    handleMonthChange(date);
  };

  return (
    <section
      aria-label={label}
      className={cn(
        'bg-white-50 max-desktop:rounded-[1.5rem] max-tablet:rounded-none w-full min-w-0 rounded-[2rem] shadow-[0_0_60px_rgb(0_0_0/0.05)]',
        className,
      )}
    >
      <CalendarHeader
        title={`${displayedMonth.getFullYear()}년 ${displayedMonth.getMonth() + 1}월`}
        onPreviousMonth={() => handleMonthChange(addMonths(displayedMonth, -1))}
        onNextMonth={() => handleMonthChange(addMonths(displayedMonth, 1))}
        headerSlot={headerSlot}
      />
      <CalendarPrimitive
        mode="single"
        required
        selected={selected}
        onSelect={handleDateChange}
        month={displayedMonth}
        onMonthChange={handleMonthChange}
        today={currentDate}
        timeZone={CALENDAR_TIME_ZONE}
        locale={ko}
        weekStartsOn={1}
        showOutsideDays
        fixedWeeks={false}
        hideNavigation
        className="w-full bg-transparent p-0"
        classNames={{
          root: 'w-full',
          months: 'w-full',
          month: 'w-full',
          month_grid: 'w-full table-fixed border-collapse',
          weekdays: '',
          weekday:
            'h-8 border-b border-slate-200 text-xs font-normal text-slate-400',
          week: '',
          day: 'relative h-40 border-b border-r border-slate-200 p-0 align-top last:border-r-0 max-desktop:h-25',
          day_button:
            'absolute inset-1 flex w-[calc(100%-0.5rem)] cursor-pointer items-start justify-start p-1 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 max-desktop:p-0.5',
          selected: 'shadow-[inset_0_0_0_2px_var(--color-primary-700)]',
          today: '',
          outside: 'bg-secondary-50',
        }}
        components={{
          DayButton: CalendarDateButton,
          Weekdays: CalendarWeekdays,
          MonthCaption: CalendarHiddenCaption,
        }}
      />
    </section>
  );
}

export { Calendar };
