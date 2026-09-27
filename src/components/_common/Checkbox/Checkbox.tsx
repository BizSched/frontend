'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { cva, type VariantProps } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

const checkboxVariants = cva(
  'relative flex size-[18px] shrink-0 items-center justify-center rounded-[6px] outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 data-disabled:cursor-not-allowed data-disabled:opacity-40',
  {
    variants: {
      variant: {
        solid:
          'border border-[#cccccc] bg-white-50 data-checked:border-transparent data-checked:bg-primary-500',
        subtle: 'bg-primary-200',
      },
    },
    defaultVariants: {
      variant: 'solid',
    },
  },
);

const checkboxIndicatorVariants = cva('size-3.5', {
  variants: {
    variant: {
      solid: 'text-white-50',
      subtle: 'text-secondary-600',
    },
  },
  defaultVariants: {
    variant: 'solid',
  },
});

interface CheckboxProps
  extends
    Omit<CheckboxPrimitive.Root.Props, 'indeterminate'>,
    VariantProps<typeof checkboxVariants> {}

function Checkbox({ className, variant, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(checkboxVariants({ variant, className }))}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center"
      >
        <CheckIcon className={checkboxIndicatorVariants({ variant })} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants };
export type { CheckboxProps };
