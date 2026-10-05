'use client';

import { cva } from 'class-variance-authority';
import type { ReactNode } from 'react';

import {
  Dropdown,
  type DropdownSize,
} from '@components/_common/Dropdown/Dropdown';
import { FormDropdownButton } from '@components/_common/FormDropdownButton/FormDropdownButton';

import { cn } from '@lib/utilities/cn';

const POPUP_SIDE_OFFSET = 1;

const formDropdownContentVariants = cva(
  'w-(--anchor-width) drop-shadow-[0px_6px_8px_rgba(0,0,0,0.12)]',
  {
    variants: {
      size: {
        large: 'rounded-[16px]',
        medium: 'rounded-[12px]',
        small: 'rounded-[12px]',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

interface FormDropdownOption {
  value: string;
  label: string;
}

interface FormDropdownProps {
  value?: string;
  options: FormDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: ReactNode;
  size?: DropdownSize;
  hasDivider?: boolean;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}

function FormDropdown({
  value,
  options,
  onChange,
  placeholder,
  size = 'large',
  hasDivider = size === 'large',
  disabled,
  className,
  contentClassName,
}: FormDropdownProps) {
  const selectedOption = options.find((option) => option.value === value);

  const items = options.map((option) => ({
    label: option.label,
    isSelected: option.value === value,
    onSelect: () => onChange(option.value),
  }));

  return (
    <Dropdown
      items={items}
      size={size}
      sideOffset={POPUP_SIDE_OFFSET}
      hasDivider={hasDivider}
      className={cn(formDropdownContentVariants({ size }), contentClassName)}
    >
      <FormDropdownButton
        size={size}
        placeholder={placeholder}
        disabled={disabled}
        className={className}
      >
        {selectedOption?.label}
      </FormDropdownButton>
    </Dropdown>
  );
}

export { FormDropdown, formDropdownContentVariants };
export type { FormDropdownProps, FormDropdownOption };
