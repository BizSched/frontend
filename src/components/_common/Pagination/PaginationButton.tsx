'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentPropsWithRef } from 'react';

import { cn } from '@lib/utilities/cn';

const paginationButtonVariants = cva(
  'inline-flex items-center justify-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none',
  {
    variants: {
      size: {
        lg: 'size-12 rounded-[1rem] text-sm tracking-[-0.03em]',
        sm: 'size-8 rounded-md text-xs',
      },
      isActive: {
        true: 'bg-primary font-semibold shadow-pagination',
        false:
          'bg-slate-50 font-medium text-muted-foreground hover:bg-slate-100',
      },
    },
    compoundVariants: [
      { size: 'lg', isActive: true, className: 'text-slate-50' },
      { size: 'sm', isActive: true, className: 'text-white-50' },
    ],
    defaultVariants: {
      size: 'lg',
      isActive: false,
    },
  },
);

type PaginationSize = NonNullable<
  VariantProps<typeof paginationButtonVariants>['size']
>;

interface PaginationButtonProps
  extends
    Omit<ComponentPropsWithRef<'button'>, 'className'>,
    VariantProps<typeof paginationButtonVariants> {
  className?: string;
}

function PaginationButton({
  size,
  isActive,
  className,
  type = 'button',
  ...props
}: PaginationButtonProps) {
  return (
    <button
      type={type}
      data-slot="pagination-button"
      data-active={isActive || undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(paginationButtonVariants({ size, isActive }), className)}
      {...props}
    />
  );
}

export { PaginationButton, paginationButtonVariants };
export type { PaginationButtonProps, PaginationSize };
