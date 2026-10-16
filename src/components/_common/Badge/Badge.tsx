import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

const badgeVariants = cva(
  'inline-flex shrink-0 items-center rounded-full border px-2 py-1 text-center text-xs leading-4 font-medium whitespace-nowrap',
  {
    variants: {
      color: {
        gray: 'border-[#e9eaeb] bg-[#fafafa] text-[#414651]',
        green: 'border-[#abefc6] bg-[#ecfdf3] text-[#067647]',
        yellow: 'border-[#fedf89] bg-[#fffaeb] text-[#b54708]',
        red: 'border-[#fecdca] bg-[#fef3f2] text-[#b42318]',
        purple: 'border-[#e9d7fe] bg-[#f9f5ff] text-[#6941c6]',
      },
    },
    defaultVariants: {
      color: 'gray',
    },
  },
);

interface BadgeProps
  extends
    Omit<ComponentProps<'span'>, 'color'>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, color, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ color, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
export type { BadgeProps };
