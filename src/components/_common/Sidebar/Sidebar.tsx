'use client';

import { Dialog } from '@base-ui/react/dialog';
import { cva } from 'class-variance-authority';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';

import { useSidebar } from './SidebarProvider';

const sidebarVariants = cva(
  'group/sidebar flex h-dvh shrink-0 flex-col bg-white-50 py-8 shadow-modal',
  {
    variants: {
      state: {
        expanded: 'w-[362px] gap-8 rounded-r-[48px] px-8 pb-16',
        collapsed: 'w-24 items-center rounded-r-[40px] px-6',
      },
    },
  },
);

interface SidebarProps extends ComponentProps<'aside'> {
  rail: ReactNode;
}

function Sidebar({ rail, children, className, ...props }: SidebarProps) {
  const { isOpen, isCompact, isOverlayOpen, setIsOverlayOpen, panelId } =
    useSidebar();
  const state = isOpen ? 'expanded' : 'collapsed';

  return (
    <>
      <aside
        {...props}
        id={`${panelId}-desktop`}
        aria-label="주 메뉴"
        data-slot="sidebar"
        data-state={state}
        className={cn(
          sidebarVariants({ state }),
          'sticky top-0 overflow-y-auto max-desktop:hidden',
          className,
        )}
      >
        {children}
      </aside>
      {rail}
      <Dialog.Root
        open={isCompact && isOverlayOpen}
        onOpenChange={setIsOverlayOpen}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-[var(--z-modal-base)] bg-black/20" />
          <Dialog.Popup
            id={`${panelId}-overlay`}
            data-slot="sidebar"
            data-state="expanded"
            className={cn(
              sidebarVariants({ state: 'expanded' }),
              'fixed inset-y-0 left-0 z-[calc(var(--z-modal-base)+1)] max-w-[calc(100vw-16px)] overflow-y-auto outline-none max-tablet:px-6 max-tablet:pb-8',
              className,
            )}
          >
            <Dialog.Title className="sr-only">주 메뉴</Dialog.Title>
            {children}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

export { Sidebar };
