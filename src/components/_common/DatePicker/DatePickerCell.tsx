'use client';

import { cva } from 'class-variance-authority';
import { DayButton as DayPickerDayButton } from 'react-day-picker';
import type { DayButtonProps, Modifiers } from 'react-day-picker';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

type DatePickerCellType = 'default' | 'today' | 'selected';

const datePickerCellVariants = cva(
  cn(
    typographyVariants({ role: 'label' }),
    'flex size-10 cursor-pointer items-center justify-center rounded-full text-slate-500 transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:font-normal disabled:text-slate-300 motion-reduce:transition-none',
  ),
  {
    variants: {
      type: {
        default: 'font-normal hover:bg-[#fafafa] hover:font-medium',
        today: 'bg-[#fafafa] font-medium hover:bg-[#f5f5f5]',
        selected:
          'bg-primary font-medium text-white-50 hover:bg-secondary-600 disabled:bg-[#fafafa]',
      } satisfies Record<DatePickerCellType, string>,
    },
    defaultVariants: {
      type: 'default',
    },
  },
);

const getDatePickerCellType = (modifiers: Modifiers): DatePickerCellType => {
  if (modifiers.selected) {
    return 'selected';
  }

  if (modifiers.today) {
    return 'today';
  }

  return 'default';
};

function DatePickerCell({ className, modifiers, ...props }: DayButtonProps) {
  const type = getDatePickerCellType(modifiers);

  return (
    <DayPickerDayButton
      data-slot="date-picker-cell"
      data-type={type}
      className={cn(
        datePickerCellVariants({ type }),
        modifiers.outside && type === 'default' && 'text-slate-300',
        className,
      )}
      modifiers={modifiers}
      {...props}
    />
  );
}

export { DatePickerCell, datePickerCellVariants, getDatePickerCellType };
export type { DatePickerCellType };
