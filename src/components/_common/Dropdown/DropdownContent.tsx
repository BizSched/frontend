'use client';

import { Menu } from '@base-ui/react/menu';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@lib/utilities/cn';

const dropdownContentVariants = cva(
  'bg-white-50 overflow-clip drop-shadow-[0px_4px_8px_rgba(0,0,0,0.1)] outline-none',
  {
    variants: {
      size: {
        large: 'w-100 rounded-[16px]',
        small: 'w-25.5 rounded-[12px]',
      },
    },
    defaultVariants: {
      size: 'large',
    },
  },
);

interface DropdownContentProps
  extends
    Omit<Menu.Popup.Props, 'className'>,
    VariantProps<typeof dropdownContentVariants> {
  className?: string;
  sideOffset?: number;
}

function DropdownContent({
  size,
  className,
  sideOffset,
  ...props
}: DropdownContentProps) {
  return (
    <Menu.Portal>
      <Menu.Positioner data-slot="dropdown-positioner" sideOffset={sideOffset}>
        <Menu.Popup
          data-slot="dropdown-content"
          className={cn(dropdownContentVariants({ size }), className)}
          {...props}
        />
      </Menu.Positioner>
    </Menu.Portal>
  );
}

export { DropdownContent, dropdownContentVariants };
export type { DropdownContentProps };
