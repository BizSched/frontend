import { cva } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const calendarEventDotVariants = cva('size-2 rounded-full', {
  variants: {
    tone: {
      accent: 'bg-primary-500',
      muted: 'bg-slate-400',
    },
  },
});

interface CalendarEventDotItem {
  id: string;
  tone: 'muted' | 'accent';
}

interface CalendarEventDotsProps {
  items: CalendarEventDotItem[];
  label: string;
  className?: string;
}

function CalendarEventDots({
  items,
  label,
  className,
}: CalendarEventDotsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <span className="sr-only">{label}</span>
      <div aria-hidden="true" className="flex items-center gap-1">
        {items.slice(0, 3).map((item) => (
          <span
            key={item.id}
            className={calendarEventDotVariants({ tone: item.tone })}
          />
        ))}
      </div>
    </div>
  );
}

export { CalendarEventDots, calendarEventDotVariants };
export type { CalendarEventDotItem, CalendarEventDotsProps };
