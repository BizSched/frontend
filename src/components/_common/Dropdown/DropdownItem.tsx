'use client';

import { Menu } from '@base-ui/react/menu';
import { cva, type VariantProps } from 'class-variance-authority';
import { useEffect, useRef } from 'react';

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
      isSelected: {
        true: 'bg-primary-alpha-30 font-semibold',
        false: '',
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
      isSelected: false,
    },
  },
);

interface DropdownItemProps
  extends
    Omit<Menu.Item.Props, 'className'>,
    VariantProps<typeof dropdownItemVariants> {
  className?: string;
  isSelected?: boolean;
}

function DropdownItem({
  size,
  isSelected = false,
  className,
  children,
  ...props
}: DropdownItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSelected) return;

    const item = itemRef.current;
    const content = item?.closest<HTMLElement>(
      '[data-slot="dropdown-content"]',
    );
    if (!item || !content) return;

    const frame = requestAnimationFrame(() => {
      const itemTop =
        item.getBoundingClientRect().top -
        content.getBoundingClientRect().top +
        content.scrollTop;
      content.scrollTop =
        itemTop - (content.clientHeight - item.offsetHeight) / 2;
    });

    return () => cancelAnimationFrame(frame);
  }, [isSelected]);

  return (
    <Menu.Item
      ref={itemRef}
      data-slot="dropdown-item"
      data-selected={isSelected || undefined}
      aria-current={isSelected || undefined}
      className={cn(dropdownItemVariants({ size }), className)}
      {...props}
    >
      <span className={cn(dropdownItemCellVariants({ size, isSelected }))}>
        {children}
      </span>
    </Menu.Item>
  );
}

export { DropdownItem, dropdownItemVariants, dropdownItemCellVariants };
export type { DropdownItemProps };
