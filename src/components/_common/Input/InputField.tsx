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
  const inputId = children.props.id ?? id;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = errorMessage ? `${inputId}-error` : undefined;
  const hasError = Boolean(errorMessage);
  const isDisabled =
    children.props.disabled ?? children.props.status === 'disabled';
  const describedBy = [
    children.props['aria-describedby'],
    hasError ? errorId : descriptionId,
  ]
    .filter(Boolean)
    .join(' ');
  const input = cloneElement(children, {
    id: inputId,
    disabled: isDisabled,
    status: hasError ? 'error' : children.props.status,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': hasError ? true : children.props['aria-invalid'],
  });

  return (
    <div
      data-slot="input-field"
      className={cn('flex flex-col gap-1.5', className)}
    >
      <label
        htmlFor={inputId}
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
          className="text-sm tracking-[-0.03em] text-warning-500"
        >
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export { InputField };
export type { InputFieldProps };
