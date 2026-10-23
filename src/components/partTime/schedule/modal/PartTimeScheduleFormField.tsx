import type { ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface PartTimeScheduleFormFieldProps {
  label: string;
  labelId: string;
  isRequired?: boolean;
  errorMessage?: string;
  children: ReactNode;
}

function PartTimeScheduleFormField({
  label,
  labelId,
  isRequired = false,
  errorMessage,
  children,
}: PartTimeScheduleFormFieldProps) {
  const errorId = errorMessage ? `${labelId}-error` : undefined;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={errorId}
      className="flex flex-col gap-2"
    >
      <p
        id={labelId}
        className={cn(
          typographyVariants({ role: 'label' }),
          'flex gap-px px-1 text-slate-500',
        )}
      >
        {label}
        {isRequired && (
          <>
            <span aria-hidden="true" className="text-primary-500">
              *
            </span>
            <span className="sr-only">(필수)</span>
          </>
        )}
      </p>
      {children}
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'px-1 text-warning-500',
          )}
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { PartTimeScheduleFormField };
