'use client';

import { useId } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormDropdown } from '@components/_common/FormDropdown/FormDropdown';
import { Input } from '@components/_common/Input/Input';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

const CUSTOM_BUSINESS_TYPE = 'CUSTOM';

const BUSINESS_TYPE_OPTIONS = [
  { value: 'RESTAURANT', label: '음식점' },
  { value: 'CAFE', label: '카페' },
  { value: 'BAKERY', label: '베이커리' },
  { value: 'PUB', label: '주점' },
  { value: 'CONVENIENCE_STORE', label: '편의점' },
  { value: CUSTOM_BUSINESS_TYPE, label: '직접입력' },
];

const DROPDOWN_CLASS_NAME =
  'h-14 w-full rounded-[16px] border border-slate-200 py-0 text-slate-700 [&_[data-placeholder]]:text-slate-400';

const DROPDOWN_CONTENT_CLASS_NAME =
  'max-h-72 overflow-y-auto drop-shadow-[0px_4px_8px_rgba(0,0,0,0.1)]';

interface AuthBusinessTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  customInputProps: UseFormRegisterReturn;
  errorMessage?: string;
  customErrorMessage?: string;
  disabled?: boolean;
}

function AuthBusinessTypeField({
  value,
  onChange,
  customInputProps,
  errorMessage,
  customErrorMessage,
  disabled = false,
}: AuthBusinessTypeFieldProps) {
  const labelId = useId();
  const customInputId = useId();
  const errorId = useId();
  const customErrorId = useId();

  const isCustom = value === CUSTOM_BUSINESS_TYPE;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={errorMessage ? errorId : undefined}
      data-slot="auth-field"
      className="flex flex-col gap-2"
    >
      <p
        id={labelId}
        className={cn(
          typographyVariants({ role: 'label' }),
          'pl-1 text-slate-700',
        )}
      >
        업종
      </p>
      <FormDropdown
        value={value || undefined}
        options={BUSINESS_TYPE_OPTIONS}
        onChange={(nextValue) => {
          if (!disabled) onChange(nextValue);
        }}
        disabled={disabled}
        placeholder="업종을 선택해주세요"
        hasDivider={false}
        className={cn(
          typographyVariants({ role: 'body' }),
          DROPDOWN_CLASS_NAME,
          errorMessage && 'border-warning-500',
        )}
        contentClassName={DROPDOWN_CONTENT_CLASS_NAME}
      />
      {errorMessage && (
        <p
          id={errorId}
          role="alert"
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'pl-1 text-warning-500',
          )}
        >
          {errorMessage}
        </p>
      )}
      {isCustom && (
        <>
          <label htmlFor={customInputId} className="sr-only">
            업종 직접 입력
          </label>
          <Input
            id={customInputId}
            disabled={disabled}
            status={customErrorMessage ? 'error' : undefined}
            aria-invalid={Boolean(customErrorMessage)}
            aria-describedby={customErrorMessage ? customErrorId : undefined}
            placeholder="업종을 입력해주세요"
            className={cn(
              !customErrorMessage && 'border-slate-200',
              '[&_input::placeholder]:text-slate-400',
            )}
            {...customInputProps}
          />
          {customErrorMessage && (
            <p
              id={customErrorId}
              role="alert"
              className={cn(
                typographyVariants({ role: 'supporting' }),
                'pl-1 text-warning-500',
              )}
            >
              {customErrorMessage}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export { AuthBusinessTypeField };
export type { AuthBusinessTypeFieldProps };
