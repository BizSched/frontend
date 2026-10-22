import type { ReactNode } from 'react';

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
        className="flex gap-px px-1 text-base font-semibold tracking-[-0.03em] text-slate-500 max-tablet:text-sm"
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
          className="px-1 text-sm tracking-[-0.03em] text-warning-500"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { PartTimeScheduleFormField };
