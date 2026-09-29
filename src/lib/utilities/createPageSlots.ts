type PaginationSlot =
  | { type: 'page'; page: number }
  | { type: 'ellipsis'; position: 'start' | 'end' };

const createPageSlots = (from: number, to: number): PaginationSlot[] => {
  return Array.from({ length: to - from + 1 }, (_, index) => ({
    type: 'page',
    page: from + index,
  }));
};

export { createPageSlots };
export type { PaginationSlot };
