'use client';

import { format } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import Image from 'next/image';
import { DayPicker } from 'react-day-picker';
import type {
  ChevronProps,
  ClassNames,
  CustomComponents,
  Formatters,
  Matcher,
} from 'react-day-picker';
import { ko as dayPickerKo } from 'react-day-picker/locale';

import { DatePickerCell } from '@components/_common/DatePicker/DatePickerCell';

import { CALENDAR_TIME_ZONE } from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';

import IcChevronLeft from '@assets/icons/ic_chevron-left.svg';
import IcChevronRight from '@assets/icons/ic_chevron-right.svg';

const NAVIGATION_BUTTON_CLASS_NAME =
  'flex size-8 cursor-pointer items-center justify-center rounded-[0.375rem] outline-none focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-40';

interface DatePickerCalendarProps {
  selected?: Date;
  onSelect: (date: Date) => void;
  defaultMonth?: Date;
  disabled?: Matcher | Matcher[];
  className?: string;
}

function DatePickerChevron({ orientation }: ChevronProps) {
  return (
    <Image
      src={orientation === 'right' ? IcChevronRight : IcChevronLeft}
      alt=""
      width={24}
      height={24}
      unoptimized
    />
  );
}

const DATE_PICKER_COMPONENTS = {
  Chevron: DatePickerChevron,
  DayButton: DatePickerCell,
} satisfies Partial<CustomComponents>;

const DATE_PICKER_FORMATTERS = {
  formatCaption: (date) => format(date, 'yyyy년 M월', { locale: ko }),
  formatWeekdayName: (date) => format(date, 'EEEEE', { locale: ko }),
} satisfies Partial<Formatters>;

const DATE_PICKER_CLASS_NAMES = {
  months: 'relative flex flex-col',
  month: 'flex flex-col gap-3',
  nav: 'absolute inset-x-0 top-0 flex items-center justify-between',
  button_previous: NAVIGATION_BUTTON_CLASS_NAME,
  button_next: NAVIGATION_BUTTON_CLASS_NAME,
  month_caption: 'flex h-8 items-center justify-center',
  caption_label:
    'text-sm leading-5 font-semibold tracking-[-0.03em] text-[#414651]',
  month_grid: 'w-full border-collapse',
  weekdays: 'flex',
  weekday:
    'flex size-10 items-center justify-center text-sm leading-5 font-medium tracking-[-0.03em] text-[#333333]',
  week: 'mt-1 flex',
  day: 'size-10 p-0 text-center',
} satisfies Partial<ClassNames>;

function DatePickerCalendar({
  selected,
  onSelect,
  defaultMonth,
  disabled,
  className,
}: DatePickerCalendarProps) {
  return (
    <DayPicker
      mode="single"
      required
      timeZone={CALENDAR_TIME_ZONE}
      selected={selected}
      onSelect={onSelect}
      defaultMonth={defaultMonth ?? selected}
      disabled={disabled}
      locale={dayPickerKo}
      showOutsideDays
      fixedWeeks
      components={DATE_PICKER_COMPONENTS}
      formatters={DATE_PICKER_FORMATTERS}
      classNames={{
        ...DATE_PICKER_CLASS_NAMES,
        root: cn('px-6 py-5', className),
      }}
    />
  );
}

export { DatePickerCalendar };
export type { DatePickerCalendarProps };
