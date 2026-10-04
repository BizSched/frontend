'use client';

import { useState } from 'react';

import { DatePickerPanel } from '@components/_common/DatePicker/DatePickerPanel';
import {
  DatePickerPopover,
  DatePickerPopoverContent,
  type DatePickerPopoverContentProps,
  DatePickerPopoverTrigger,
} from '@components/_common/DatePicker/DatePickerPopover';
import {
  DatePickerSheet,
  DatePickerSheetContent,
  DatePickerSheetTrigger,
} from '@components/_common/DatePicker/DatePickerSheet';

import { useDatePickerLayout } from '@hooks/datePicker/useDatePickerLayout';

import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';

interface DatePickerProps {
  value?: Date;
  defaultValue?: Date;
  onChange?: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  align?: DatePickerPopoverContentProps['align'];
}

const formatDatePickerValue = (date: Date) =>
  formatCalendarDate(date).replaceAll('-', '.');

function DatePicker(props: DatePickerProps) {
  const {
    value,
    defaultValue,
    onChange,
    placeholder = '날짜 선택',
    disabled,
    className,
    align = 'start',
  } = props;
  const isControlled = 'value' in props;

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [pendingDate, setPendingDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  const layout = useDatePickerLayout();

  const selectedDate = isControlled ? value : uncontrolledValue;

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setPendingDate(selectedDate);
    }

    setIsOpen(nextOpen);
  };

  const handleCancel = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    if (!pendingDate) {
      return;
    }

    if (!isControlled) {
      setUncontrolledValue(pendingDate);
    }

    onChange?.(pendingDate);
    setIsOpen(false);
  };

  const triggerClassName = cn(
    'flex h-14 w-full cursor-pointer items-center rounded-[16px] border border-slate-300 bg-white-50 px-4 text-base tracking-[-0.02em] text-slate-700 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[popup-open]:border-ring motion-reduce:transition-none',
    !selectedDate && 'text-muted-foreground',
    className,
  );
  const triggerLabel = selectedDate
    ? formatDatePickerValue(selectedDate)
    : placeholder;
  const panel = (
    <DatePickerPanel
      selected={pendingDate}
      onSelect={setPendingDate}
      onCancel={handleCancel}
      onConfirm={handleConfirm}
    />
  );

  if (layout === 'sheet') {
    return (
      <DatePickerSheet open={isOpen} onOpenChange={handleOpenChange}>
        <DatePickerSheetTrigger
          disabled={disabled}
          className={triggerClassName}
        >
          {triggerLabel}
        </DatePickerSheetTrigger>
        <DatePickerSheetContent>{panel}</DatePickerSheetContent>
      </DatePickerSheet>
    );
  }

  return (
    <DatePickerPopover open={isOpen} onOpenChange={handleOpenChange}>
      <DatePickerPopoverTrigger
        disabled={disabled}
        className={triggerClassName}
      >
        {triggerLabel}
      </DatePickerPopoverTrigger>
      <DatePickerPopoverContent align={align}>{panel}</DatePickerPopoverContent>
    </DatePickerPopover>
  );
}

export { DatePicker };
export type { DatePickerProps };
