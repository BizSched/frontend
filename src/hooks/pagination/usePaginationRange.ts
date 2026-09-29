import {
  createPageSlots,
  type PaginationSlot,
} from '@lib/utilities/createPageSlots';

interface UsePaginationRangeParams {
  currentPage: number;
  totalPages: number;
  visibleCount: number;
}

const usePaginationRange = ({
  currentPage,
  totalPages,
  visibleCount,
}: UsePaginationRangeParams): PaginationSlot[] => {
  if (totalPages <= visibleCount) {
    return createPageSlots(1, totalPages);
  }

  const siblingCount = Math.floor((visibleCount - 5) / 2);
  const edgeRunLength = visibleCount - 2;
  const firstSlot: PaginationSlot = { type: 'page', page: 1 };
  const lastSlot: PaginationSlot = { type: 'page', page: totalPages };

  if (currentPage <= siblingCount + 3) {
    return [
      ...createPageSlots(1, edgeRunLength),
      { type: 'ellipsis', position: 'end' },
      lastSlot,
    ];
  }

  if (currentPage >= totalPages - siblingCount - 2) {
    return [
      firstSlot,
      { type: 'ellipsis', position: 'start' },
      ...createPageSlots(totalPages - edgeRunLength + 1, totalPages),
    ];
  }

  return [
    firstSlot,
    { type: 'ellipsis', position: 'start' },
    ...createPageSlots(currentPage - siblingCount, currentPage + siblingCount),
    { type: 'ellipsis', position: 'end' },
    lastSlot,
  ];
};

export { usePaginationRange };
export type { UsePaginationRangeParams };
