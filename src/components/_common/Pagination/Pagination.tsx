'use client';

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { usePaginationRange } from '@hooks/pagination/usePaginationRange';
import {
  usePaginationSize,
  type PaginationSize,
} from '@hooks/pagination/usePaginationSize';

import { PaginationButton } from './PaginationButton';
import { PaginationContent } from './PaginationContent';
import { PaginationEllipsis } from './PaginationEllipsis';
import { PaginationItem } from './PaginationItem';
import { PaginationRoot } from './PaginationRoot';

const PAGINATION_VISIBLE_COUNT = {
  lg: 7,
  sm: 5,
} as const satisfies Record<PaginationSize, number>;

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  size?: PaginationSize;
  label?: string;
  className?: string;
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size,
  label = '페이지',
  className,
}: PaginationProps) {
  const resolvedSize = usePaginationSize(size);
  const slots = usePaginationRange({
    currentPage,
    totalPages,
    visibleCount: PAGINATION_VISIBLE_COUNT[resolvedSize],
  });

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationRoot aria-label={label} className={className}>
      <PaginationContent className="gap-1">
        <PaginationItem className="mr-1.5">
          <PaginationButton
            size={resolvedSize}
            aria-label="이전 페이지"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </PaginationButton>
        </PaginationItem>
        {slots.map((slot) =>
          slot.type === 'page' ? (
            <PaginationItem key={`page-${slot.page}`}>
              <PaginationButton
                size={resolvedSize}
                isActive={slot.page === currentPage}
                aria-label={`${slot.page}페이지로 이동`}
                onClick={() => {
                  if (slot.page !== currentPage) {
                    onPageChange(slot.page);
                  }
                }}
              >
                {slot.page}
              </PaginationButton>
            </PaginationItem>
          ) : (
            <PaginationItem key={`ellipsis-${slot.position}`}>
              <PaginationEllipsis size={resolvedSize} />
            </PaginationItem>
          ),
        )}
        <PaginationItem className="ml-1.5">
          <PaginationButton
            size={resolvedSize}
            aria-label="다음 페이지"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRightIcon className="size-5" aria-hidden="true" />
          </PaginationButton>
        </PaginationItem>
      </PaginationContent>
    </PaginationRoot>
  );
}

export { Pagination, PAGINATION_VISIBLE_COUNT };
export type { PaginationProps };
