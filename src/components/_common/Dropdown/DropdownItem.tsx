'use client';

import { Menu } from '@base-ui/react/menu';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const dropdownItemVariants = cva(
  'group/dropdown-item block cursor-pointer outline-none select-none',
  {
    variants: {
      size: {
        large: 'p-[6px]',
        small: 'p-[5px]',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

const dropdownItemCellVariants = cva(
  'block tracking-[-0.03em] text-[#333333] transition-colors',
  {
    variants: {
      size: {
        large: 'rounded-[12px] p-[8px] text-[16px] leading-[24px]',
        small: 'rounded-[8px] px-[6px] py-[3px] text-[14px] leading-[20px]',
      },
    },
    compoundVariants: [
      {
        size: 'large',
        className: 'group-focus/dropdown-item:bg-slate-200',
      },
      {
        size: 'small',
        className: 'group-focus/dropdown-item:bg-primary-alpha-20',
      },
    ],
    defaultVariants: {
      size: 'large',
    },
  },
);

interface DropdownItemProps
  extends
    Omit<Menu.Item.Props, 'className'>,
    VariantProps<typeof dropdownItemVariants> {
  className?: string;
}

function DropdownItem({
  size,
  className,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <Menu.Item
      data-slot="dropdown-item"
      className={cn(dropdownItemVariants({ size }), className)}
      {...props}
    >
      <span className={dropdownItemCellVariants({ size })}>{children}</span>
    </Menu.Item>
  );
}

export { DropdownItem, dropdownItemVariants, dropdownItemCellVariants };
export type { DropdownItemProps };
