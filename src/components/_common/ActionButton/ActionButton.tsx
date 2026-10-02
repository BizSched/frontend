'use client';

import { Menu } from '@base-ui/react/menu';
import { PlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { ICON_BUTTON_BASE_CLASSNAME } from '@components/_common/IconButton/iconButtonBase';

import { cn } from '@lib/utilities/cn';

interface ActionButtonItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

type ActionButtonProps = Omit<Menu.Trigger.Props, 'children' | 'className'> &
  Required<Pick<Menu.Trigger.Props, 'aria-label'>> &
  Pick<Menu.Root.Props, 'open' | 'defaultOpen' | 'onOpenChange'> & {
    actions: ActionButtonItem[];
    className?: string;
  };

function ActionButton({
  actions,
  open,
  defaultOpen,
  onOpenChange,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Menu.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Menu.Trigger
        data-slot="action-button"
        className={cn(
          ICON_BUTTON_BASE_CLASSNAME,
          'size-14 bg-primary-500 text-white-50',
          'data-popup-open:shadow-[0_1px_4px_0_var(--color-slate-600)]',
          '[&_svg]:transition-transform data-popup-open:[&_svg]:rotate-45',
          className,
        )}
        {...props}
      >
        <PlusIcon className="size-6" strokeWidth={1.8} aria-hidden="true" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="top" align="center" sideOffset={4}>
          <Menu.Popup
            data-slot="action-button-popup"
            className="flex flex-col items-center gap-1 transition-[opacity,translate] duration-150 outline-none data-ending-style:translate-y-2 data-ending-style:opacity-0 data-starting-style:translate-y-2 data-starting-style:opacity-0"
          >
            {actions.map(({ icon, label, onClick }) => (
              <Menu.Item
                key={label}
                data-slot="action-button-item"
                aria-label={label}
                onClick={onClick}
                className={cn(
                  ICON_BUTTON_BASE_CLASSNAME,
                  'size-10 bg-slate-50 text-primary-500 [&_svg]:size-6',
                  'shadow-[0_1px_4px_0_var(--color-slate-600)]',
                )}
              >
                {icon}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

export { ActionButton };
export type { ActionButtonItem, ActionButtonProps };
