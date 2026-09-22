'use client';

import { type ComponentPropsWithoutRef } from 'react';

import { cn } from '@lib/utilities/cn';

interface InputActionProps extends ComponentPropsWithoutRef<'button'> {
  'aria-label': string;
}

function InputAction({ className, children, ...rest }: InputActionProps) {
  return (
    <button
      type="button"
      data-slot="input-action"
      className={cn(
        'focus-visible:ring-primary-500 inline-flex shrink-0 items-center justify-center text-slate-400 transition-opacity hover:opacity-60 focus-visible:ring-2 focus-visible:outline-none',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

export { InputAction };
export type { InputActionProps };
