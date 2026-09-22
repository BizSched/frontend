import { type ComponentPropsWithoutRef, type ReactElement } from 'react';

import { cn } from '@lib/utilities/cn';

interface InputIconProps extends ComponentPropsWithoutRef<'span'> {
  size?: 'large' | 'small';
  children: ReactElement;
}

function InputIcon({
  size = 'large',
  className,
  children,
  ...rest
}: InputIconProps) {
  return (
    <span
      data-slot="input-icon"
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-slate-400',
        size === 'large' ? 'size-6' : 'size-5',
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export { InputIcon };
export type { InputIconProps };
