'use client';

import { Menu } from '@base-ui/react/menu';
import type { ReactElement } from 'react';

import { DropdownContent } from './DropdownContent';
import { DropdownItem } from './DropdownItem';

type DropdownSize = 'large' | 'small';

interface DropdownOption {
  label: string;
  onSelect?: () => void;
}

interface DropdownProps {
  children: ReactElement;
  items: DropdownOption[];
  size?: DropdownSize;
  className?: string;
}

function Dropdown({
  children,
  items,
  size = 'large',
  className,
}: DropdownProps) {
  return (
    <Menu.Root>
      <Menu.Trigger data-slot="dropdown-trigger" render={children} />
      <DropdownContent size={size} className={className}>
        {items.map((item, index) => (
          <DropdownItem
            key={`${item.label}-${index}`}
            size={size}
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
