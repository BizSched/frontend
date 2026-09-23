'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { Button } from '@components/_common/Button/Button';

import type { PaginationSize } from '@hooks/pagination/usePaginationSize';

import { cn } from '@lib/utilities/cn';

const BUTTON_OVERRIDE_CLASS_NAME = 'gap-0 px-0 py-0 [&_svg]:size-5';

const paginationButtonVariants = cva(
  'inline-flex items-center justify-center outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-40 motion-reduce:transition-none',
  {
    variants: {
      size: {
        lg: 'size-12 rounded-[1rem] text-sm tracking-[-0.03em]',
        sm: 'size-8 rounded-md text-xs tracking-normal',
      } satisfies Record<PaginationSize, string>,
      isActive: {
        true: 'bg-primary font-semibold shadow-[0_0.625rem_2.5rem_rgb(255_158_89/0.3)]',
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

interface PaginationButtonProps
  extends
    Omit<
      ComponentProps<typeof Button>,
      'className' | 'hierarchy' | 'size' | 'icon'
    >,
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
    <Button
      type={type}
      data-slot="pagination-button"
      data-active={isActive || undefined}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        BUTTON_OVERRIDE_CLASS_NAME,
        paginationButtonVariants({ size, isActive }),
        isActive ? 'hover:bg-primary' : 'disabled:bg-slate-50',
        className,
      )}
      {...props}
    />
  );
}

export { PaginationButton, paginationButtonVariants };
export type { PaginationButtonProps };
