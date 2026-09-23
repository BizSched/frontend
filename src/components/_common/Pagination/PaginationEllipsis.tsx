import { EllipsisIcon } from 'lucide-react';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '@lib/utilities/cn';

import {
  paginationButtonVariants,
  type PaginationSize,
} from './PaginationButton';

interface PaginationEllipsisProps extends Omit<
  ComponentPropsWithRef<'span'>,
  'className'
> {
  size?: PaginationSize;
  className?: string;
}

function PaginationEllipsis({
  size,
  className,
  ...props
}: PaginationEllipsisProps) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(paginationButtonVariants({ size }), className)}
      {...props}
    >
      <EllipsisIcon className="size-6" aria-hidden="true" />
      <span className="sr-only">더 많은 페이지</span>
    </span>
  );
}

export { PaginationEllipsis };
export type { PaginationEllipsisProps };
