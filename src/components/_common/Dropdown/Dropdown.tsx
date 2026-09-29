'use client';

import { Menu } from '@base-ui/react/menu';
import type { ReactElement } from 'react';

import { DropdownContent } from './DropdownContent';
import { DropdownItem } from './DropdownItem';

type DropdownSize = 'large' | 'medium' | 'small';

interface DropdownOption {
  label: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

interface DropdownProps {
  children: ReactElement;
  items: DropdownOption[];
  size?: DropdownSize;
  sideOffset?: number;
  hasDivider?: boolean;
  className?: string;
}

function Dropdown({
  children,
  items,
  size = 'large',
  sideOffset,
  hasDivider,
  className,
}: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger data-slot="dropdown-trigger" render={children} />
      <DropdownContent
        size={size}
        sideOffset={sideOffset}
        className={className}
      >
        {items.map((item, index) => (
          <DropdownItem
            key={`${item.label}-${index}`}
            size={size}
            hasDivider={hasDivider}
            isSelected={item.isSelected}
            onClick={item.onSelect}
          >
            {item.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Menu.Root>
  );
}

export { Dropdown };
export type { DropdownProps, DropdownOption, DropdownSize };
