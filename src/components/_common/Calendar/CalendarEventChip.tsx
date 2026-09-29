import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';

const calendarEventChipVariants = cva(
  'flex min-w-0 items-center gap-1 rounded-sm border px-2 py-1 text-xs leading-4 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        accent: 'border-primary-400 bg-primary-100 text-accent-500',
        muted: 'border-slate-200 bg-slate-50 text-slate-400',
      },
      isInteractive: {
        true: 'cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-1',
        false: '',
      },
    },
  },
);

interface CalendarEventChipProps {
  label: string;
  tone: 'muted' | 'accent';
  leadingSlot?: ReactNode;
  onClick?: () => void;
  className?: string;
}

function CalendarEventChip({
  label,
  tone,
  leadingSlot,
  onClick,
  className,
}: CalendarEventChipProps) {
  const content = (
    <>
      {leadingSlot}
      <span className="truncate">{label}</span>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        className={cn(
          calendarEventChipVariants({
            tone,
            isInteractive: true,
            className,
          }),
        )}
        onClick={onClick}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        calendarEventChipVariants({
          tone,
          isInteractive: false,
          className,
        }),
      )}
    >
      {content}
    </div>
  );
}

export { CalendarEventChip, calendarEventChipVariants };
export type { CalendarEventChipProps };
