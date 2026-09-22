import { cloneElement, type ReactElement } from 'react';

import { cn } from '@lib/utilities/cn';

import { type InputProps } from './Input';

interface InputFieldProps {
  id: string;
  label: string;
  description?: string;
  errorMessage?: string;
  className?: string;
  children: ReactElement<InputProps>;
}

function InputField({
  id,
  label,
  description,
  errorMessage,
  className,
  children,
}: InputFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = errorMessage ? `${id}-error` : undefined;
  const hasError = Boolean(errorMessage);
  const describedBy = [
    children.props['aria-describedby'],
    hasError ? errorId : descriptionId,
  ]
    .filter(Boolean)
    .join(' ');
  const input = cloneElement(children, {
    id,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': hasError || children.props['aria-invalid'] || undefined,
  });

  return (
    <div
      data-slot="input-field"
      className={cn('flex flex-col gap-1.5', className)}
    >
      <label
        htmlFor={id}
        data-slot="input-label"
        className="text-sm font-medium tracking-[-0.03em] text-slate-700"
      >
        {label}
      </label>

      <div data-slot="input-field-control">{input}</div>

      {description && !hasError && (
        <p
          id={descriptionId}
          data-slot="input-description"
          className="text-sm tracking-[-0.03em] text-slate-400"
        >
          {description}
        </p>
      )}

      {hasError && (
        <p
          id={errorId}
          data-slot="input-error"
          role="alert"
          className="text-warning-500 text-sm tracking-[-0.03em]"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { InputField };
export type { InputFieldProps };
