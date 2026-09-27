'use client';

import { cva } from 'class-variance-authority';

import {
  Dropdown,
  type DropdownSize,
} from '@components/_common/Dropdown/Dropdown';
import { MonthDropdownButton } from '@components/_common/MonthDropdownButton/MonthDropdownButton';

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

const POPUP_SIDE_OFFSET = 4;

const monthSelectDropdownContentVariants = cva(
  'w-(--anchor-width) [scrollbar-width:none] overflow-auto rounded-[20px] drop-shadow-[0px_2px_2px_rgba(0,0,0,0.25)]',
  {
    variants: {
      size: {
        large: 'h-[232px]',
        small: 'h-[205px]',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

interface MonthSelectDropdownProps {
  value: number;
  onChange: (month: number) => void;
  size?: DropdownSize;
  className?: string;
}

function MonthSelectDropdown({
  value,
  onChange,
  size = 'large',
  className,
}: MonthSelectDropdownProps) {
  const items = MONTHS.map((month) => ({
    label: `${month}월`,
    isSelected: month === value,
    onSelect: () => onChange(month),
  }));

  return (
    <Dropdown
      items={items}
      size={size}
      sideOffset={POPUP_SIDE_OFFSET}
      className={monthSelectDropdownContentVariants({ size })}
    >
      <MonthDropdownButton size={size} className={className}>
        {`${value}월`}
      </MonthDropdownButton>
    </Dropdown>
  );
}

export { MonthSelectDropdown, monthSelectDropdownContentVariants };
export type { MonthSelectDropdownProps };
