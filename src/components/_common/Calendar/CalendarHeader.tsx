import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import type { ReactNode } from 'react';

interface CalendarHeaderProps {
  title: string;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  headerSlot?: ReactNode;
}

function CalendarHeader({
  title,
  onPreviousMonth,
  onNextMonth,
  headerSlot,
}: CalendarHeaderProps) {
  const buttonClassName =
    'flex size-6 shrink-0 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500';

  return (
    <div className="max-desktop:flex-col max-desktop:items-stretch max-desktop:px-4 max-tablet:py-6 flex items-center justify-between gap-4 px-8 py-5 text-slate-500">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="이전 달"
          className={buttonClassName}
          onClick={onPreviousMonth}
        >
          <ChevronsLeft className="size-6" aria-hidden="true" />
        </button>
        <span
          aria-live="polite"
          aria-atomic="true"
          className="text-lg font-semibold"
        >
          {title}
        </span>
        <button
          type="button"
          aria-label="다음 달"
          className={buttonClassName}
          onClick={onNextMonth}
        >
          <ChevronsRight className="size-6" aria-hidden="true" />
        </button>
      </div>
      {headerSlot !== null && headerSlot !== undefined && (
        <div className="min-w-0">{headerSlot}</div>
      )}
    </div>
  );
}

export { CalendarHeader };
