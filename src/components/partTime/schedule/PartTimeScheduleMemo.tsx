import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

import { cn } from '@lib/utilities/cn';

import IcChevronDown from '@assets/icons/ic_chevron-down.svg';
import IcChevronUp from '@assets/icons/ic_chevron-up.svg';

interface PartTimeScheduleMemoProps {
  memo: string;
  className?: string;
}

function PartTimeScheduleMemo({ memo, className }: PartTimeScheduleMemoProps) {
  const memoId = useId();
  const memoRef = useRef<HTMLParagraphElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = memoRef.current;

    if (!element || isExpanded) {
      return;
    }

    const observer = new ResizeObserver(() =>
      setIsOverflowing(element.scrollHeight > element.clientHeight),
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [memo, isExpanded]);

  return (
    <div className={cn('flex items-start gap-1', className)}>
      <p
        ref={memoRef}
        id={memoId}
        className={cn(
          'min-w-0 flex-1 text-xs leading-4 tracking-[-0.03em] wrap-break-word whitespace-pre-wrap text-slate-400',
          !isExpanded && 'line-clamp-2',
        )}
      >
        {memo}
      </p>
      {(isOverflowing || isExpanded) && (
        <button
          type="button"
          aria-label={isExpanded ? '메모 접기' : '메모 펼치기'}
          aria-expanded={isExpanded}
          aria-controls={memoId}
          className="shrink-0 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          <Image
            src={isExpanded ? IcChevronUp : IcChevronDown}
            alt=""
            width={16}
            height={16}
            unoptimized
          />
        </button>
      )}
    </div>
  );
}

export { PartTimeScheduleMemo };
export type { PartTimeScheduleMemoProps };
