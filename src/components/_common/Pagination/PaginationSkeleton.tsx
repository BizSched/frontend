'use client';

import {
  usePaginationSize,
  type PaginationSize,
} from '@hooks/pagination/usePaginationSize';

import { cn } from '@lib/utilities/cn';

import { PAGINATION_VISIBLE_COUNT } from './Pagination';
import { paginationButtonVariants } from './PaginationButton';

interface PaginationSkeletonProps {
  size?: PaginationSize;
  className?: string;
}

function PaginationSkeleton({ size, className }: PaginationSkeletonProps) {
  const resolvedSize = usePaginationSize(size);
  const cellCount = PAGINATION_VISIBLE_COUNT[resolvedSize] + 2;

  return (
    <div
      aria-hidden="true"
      data-slot="pagination-skeleton"
      className={cn('mx-auto flex w-full justify-center', className)}
    >
      <div className="flex items-center gap-1">
        {Array.from({ length: cellCount }, (_, index) => (
          <span
            key={index}
            className={cn(
              paginationButtonVariants({ size: resolvedSize }),
              'pointer-events-none animate-pulse motion-reduce:animate-none',
              index === 0 && 'mr-1.5',
              index === cellCount - 1 && 'ml-1.5',
            )}
          />
        ))}
      </div>
    </div>
  );
}

export { PaginationSkeleton };
export type { PaginationSkeletonProps };
