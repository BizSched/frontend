'use client';

import { Button } from '@base-ui/react/button';
import { ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';

import { useSidebar } from './SidebarProvider';

type SidebarTriggerProps = Button.Props;

function SidebarTrigger({
  className,
  onClick,
  children,
  ...props
}: SidebarTriggerProps) {
  const { isOpen, isCompact, isOverlayOpen, panelId, toggleSidebar } =
    useSidebar();
  const isExpanded = isCompact ? isOverlayOpen : isOpen;
  const Icon = isExpanded ? ChevronsLeftIcon : ChevronsRightIcon;

  return (
    <Button
      {...props}
      data-slot="sidebar-trigger"
      aria-label={isExpanded ? '사이드바 접기' : '사이드바 펼치기'}
      aria-expanded={isExpanded}
      aria-controls={`${panelId}-${isCompact ? 'overlay' : 'desktop'}`}
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-lg outline-none hover:bg-primary-100 focus-visible:ring-2 focus-visible:ring-primary-500',
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggleSidebar();
      }}
    >
      {children ?? <Icon size={32} className="text-[#A4A4A4]" />}
    </Button>
  );
}

export { SidebarTrigger };
