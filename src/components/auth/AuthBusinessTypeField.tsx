'use client';

import { useId } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

import { FormDropdown } from '@components/_common/FormDropdown/FormDropdown';
import { Input } from '@components/_common/Input/Input';

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
  'h-14 w-full rounded-[16px] border border-slate-200 py-0 text-base font-normal tracking-[-0.02em] text-slate-700 [&_[data-placeholder]]:text-slate-400';

const DROPDOWN_CONTENT_CLASS_NAME =
  'max-h-72 overflow-y-auto drop-shadow-[0px_4px_8px_rgba(0,0,0,0.1)]';

interface AuthBusinessTypeFieldProps {
  value: string;
  onChange: (value: string) => void;
  customInputProps: UseFormRegisterReturn;
}

function AuthBusinessTypeField({
  value,
  onChange,
  customInputProps,
}: AuthBusinessTypeFieldProps) {
  const labelId = useId();
  const customInputId = useId();

  const isCustom = value === CUSTOM_BUSINESS_TYPE;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      data-slot="auth-field"
      className="flex flex-col gap-2"
    >
      <p
        id={labelId}
        className="pl-1 text-base font-semibold tracking-[-0.03em] text-slate-700"
      >
        업종
      </p>
      <FormDropdown
        value={value || undefined}
        options={BUSINESS_TYPE_OPTIONS}
        onChange={onChange}
        placeholder="업종을 선택해주세요"
        hasDivider={false}
        className={DROPDOWN_CLASS_NAME}
        contentClassName={DROPDOWN_CONTENT_CLASS_NAME}
      />
      {isCustom && (
        <>
          <label htmlFor={customInputId} className="sr-only">
            업종 직접 입력
          </label>
          <Input
            id={customInputId}
            placeholder="업종을 입력해주세요"
            className="border-slate-200 [&_input::placeholder]:text-slate-400"
            {...customInputProps}
          />
        </>
      )}
    </div>
  );
}

export { AuthBusinessTypeField };
export type { AuthBusinessTypeFieldProps };
