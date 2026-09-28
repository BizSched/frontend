'use client';

import type { ReactNode } from 'react';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';

import { CalendarDayButton } from '@components/_common/Calendar/CalendarDayButton';
import {
  CalendarDayCell,
  CalendarDayCellProvider,
  type CalendarDayContent,
} from '@components/_common/Calendar/CalendarDayCell';
import { CalendarHeader } from '@components/_common/Calendar/CalendarHeader';

import {
  CALENDAR_TIME_ZONE,
  formatCalendarDate,
  formatCalendarMonth,
  parseCalendarDate,
  parseCalendarMonth,
  shiftCalendarMonth,
} from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';

interface CalendarProps {
  selectedDate: string | null;
  onDateChange: (date: string) => void;
  month: string;
  onMonthChange: (month: string) => void;
  today: string;
  contentByDate?: Record<string, CalendarDayContent>;
  headerSlot?: ReactNode;
  label?: string;
  className?: string;
}

function Calendar({
  selectedDate,
  onDateChange,
  month,
  onMonthChange,
  today,
  contentByDate = {},
  headerSlot,
  label = '캘린더',
  className,
}: CalendarProps) {
  const selected = selectedDate ? parseCalendarDate(selectedDate) : undefined;
  const displayedMonth = parseCalendarMonth(month);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const nextDate = formatCalendarDate(date);

    if (nextDate === selectedDate) {
      return;
    }

    const nextMonth = formatCalendarMonth(date);

    onDateChange(nextDate);

    if (nextMonth !== month) {
      onMonthChange(nextMonth);
    }
  };

  const handleMonthChange = (date: Date) => {
    const nextMonth = formatCalendarMonth(date);

    if (nextMonth !== month) {
      onMonthChange(nextMonth);
    }
  };

  const handlePreviousMonth = () => {
    onMonthChange(shiftCalendarMonth(month, -1));
  };

  const handleNextMonth = () => {
    onMonthChange(shiftCalendarMonth(month, 1));
  };

  const handleDateSelectFromCell = (date: string) => {
    handleDateSelect(parseCalendarDate(date));
  };

  return (
    <section
      aria-label={label}
      className={cn(
        'bg-white-50 max-tablet:rounded-[1.5rem] max-mobile:rounded-none w-full min-w-0 overflow-hidden rounded-[2rem] shadow-[0_0_60px_rgb(0_0_0/0.05)]',
        className,
      )}
    >
      <CalendarHeader
        month={month}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        headerSlot={headerSlot}
      />
      <CalendarDayCellProvider
        contentByDate={contentByDate}
        onDateSelect={handleDateSelectFromCell}
      >
        <DayPicker
          mode="single"
          required
          month={displayedMonth}
          selected={selected}
          today={parseCalendarDate(today)}
          timeZone={CALENDAR_TIME_ZONE}
          locale={ko}
          weekStartsOn={1}
          showOutsideDays
          hideNavigation
          onSelect={handleDateSelect}
          onMonthChange={handleMonthChange}
          aria-label={label}
          components={{
            Day: CalendarDayCell,
            DayButton: CalendarDayButton,
          }}
          formatters={{
            formatWeekdayName: (date) =>
              new Intl.DateTimeFormat('ko-KR', {
                weekday: 'short',
                timeZone: CALENDAR_TIME_ZONE,
              }).format(date),
          }}
          classNames={{
            root: 'w-full',
            months: 'w-full',
            month: 'w-full',
            month_caption: 'hidden',
            month_grid: 'w-full table-fixed border-separate border-spacing-0',
            weekdays: 'h-8 [&>th:first-child]:border-l',
            weekday:
              'h-8 border-y border-r border-slate-200 bg-white-50 text-center text-xs leading-4 font-normal text-slate-400',
            weeks:
              '[&>tr>td:first-child]:border-l [&>tr:last-child>td:first-child]:overflow-hidden [&>tr:last-child>td:first-child]:rounded-bl-[2rem] [&>tr:last-child>td:last-child]:overflow-hidden [&>tr:last-child>td:last-child]:rounded-br-[2rem] max-tablet:[&>tr:last-child>td:first-child]:rounded-bl-[1.5rem] max-tablet:[&>tr:last-child>td:last-child]:rounded-br-[1.5rem] max-mobile:[&>tr:last-child>td:first-child]:rounded-bl-none max-mobile:[&>tr:last-child>td:last-child]:rounded-br-none',
            week: 'h-40 max-tablet:h-[6.25rem]',
            day: 'relative h-40 border-r border-b border-slate-200 bg-white-50 p-0 align-top max-tablet:h-[6.25rem]',
            outside: 'bg-slate-50',
            selected: 'shadow-[inset_0_0_0_2px_var(--color-primary-700)] z-10',
          }}
        />
      </CalendarDayCellProvider>
    </section>
  );
}

export { Calendar };
export type { CalendarDayContent, CalendarProps };
