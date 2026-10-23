'use client';

import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const radioGroupItemVariants = cva(
  'relative flex shrink-0 items-center justify-center rounded-full border-[1.6px] border-slate-300 bg-white-50 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-primary-500',
  {
    variants: {
      size: {
        default: 'size-5',
        small: 'size-4.5',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);

const radioGroupIndicatorVariants = cva('rounded-full bg-secondary-600', {
  variants: {
    size: {
      default: 'size-2.5',
      small: 'size-2',
    },
  },
  defaultVariants: {
    size: 'default',
  },
});

interface RadioGroupItemProps
  extends
    Omit<RadioPrimitive.Root.Props, 'disabled'>,
    VariantProps<typeof radioGroupItemVariants> {}

function RadioGroupItem({ className, size, ...props }: RadioGroupItemProps) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ size, className }))}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className={radioGroupIndicatorVariants({ size })}
      />
    </RadioPrimitive.Root>
  );
}

export { RadioGroupItem, radioGroupItemVariants };
export type { RadioGroupItemProps };
