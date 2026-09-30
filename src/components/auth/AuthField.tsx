import { cloneElement, type ReactElement } from 'react';

import { type InputProps } from '@components/_common/Input/Input';

import { cn } from '@lib/utilities/cn';

interface AuthFieldProps {
  id: string;
  label: string;
  isLabelHidden?: boolean;
  errorMessage?: string;
  children: ReactElement<InputProps>;
}

function AuthField({
  id,
  label,
  isLabelHidden = false,
  errorMessage,
  children,
}: AuthFieldProps) {
  const errorId = `${id}-error`;
  const hasError = Boolean(errorMessage);
  const input = cloneElement(children, {
    id,
    status: hasError ? 'error' : children.props.status,
    'aria-invalid': hasError || children.props['aria-invalid'],
    'aria-describedby': hasError ? errorId : children.props['aria-describedby'],
    className: cn(
      !hasError && 'border-slate-200',
      '[&_input::placeholder]:text-slate-400',
      children.props.className,
    ),
  });

  return (
    <div data-slot="auth-field" className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className={
          isLabelHidden
            ? 'sr-only'
            : 'pl-1 text-base font-semibold tracking-[-0.03em] text-slate-700'
        }
      >
        {label}
      </label>
      {input}
      {hasError && (
        <p
          id={errorId}
          role="alert"
          className="pl-1 text-sm tracking-[-0.03em] text-warning-500"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { AuthField };
