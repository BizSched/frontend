import { cva, type VariantProps } from 'class-variance-authority';
import {
  forwardRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';

import { cn } from '@lib/utilities/cn';

const inputVariants = cva(
  'flex w-full items-center border bg-white-50 transition-colors outline-none tracking-[-0.02em] placeholder:text-slate-300 focus:outline-none',
  {
    variants: {
      size: {
        large: 'h-14 gap-2 rounded-[16px] px-4 py-4 text-base',
        small: 'h-11 gap-2 rounded-[12px] px-3 py-3 text-sm tracking-[-0.03em]',
      },
      variant: {
        default: '',
        search: 'h-12 gap-2 rounded-full px-5 py-3',
      },
      tone: {
        default: 'bg-white-50',
        muted: 'bg-slate-50',
      },
      status: {
        default: 'border-slate-300 text-slate-500',
        done: 'border-slate-300 text-slate-700',
        typing: 'border-primary-500 text-slate-700',
        error: 'border-warning-500 text-slate-700',
        disabled:
          'border-slate-300 bg-slate-50 text-slate-500 disabled:cursor-not-allowed',
      },
    },
    defaultVariants: {
      size: 'large',
      variant: 'default',
      tone: 'default',
      status: 'default',
    },
  },
);

interface InputProps
  extends
    Omit<ComponentPropsWithoutRef<'input'>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    size,
    variant,
    tone,
    status,
    leftSlot,
    rightSlot,
    className,
    disabled,
    ...rest
  },
  ref,
) {
  const resolvedStatus = disabled ? 'disabled' : status;

  return (
    <div
      data-slot="input-root"
      className={cn(
        inputVariants({ size, variant, tone, status: resolvedStatus }),
        className,
      )}
    >
      {leftSlot && (
        <span data-slot="input-left-slot" className="shrink-0">
          {leftSlot}
        </span>
      )}
      <input
        ref={ref}
        data-slot="input"
        disabled={disabled}
        className="placeholder:inherit min-w-0 flex-1 bg-transparent outline-none"
        {...rest}
      />
      {rightSlot && (
        <span data-slot="input-right-slot" className="shrink-0">
          {rightSlot}
        </span>
      )}
    </div>
  );
});

export { Input, inputVariants };
export type { InputProps };
