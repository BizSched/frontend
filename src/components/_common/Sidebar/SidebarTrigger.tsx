'use client';

import { Button } from '@base-ui/react/button';
import Image from 'next/image';

import { cn } from '@lib/utilities/cn';

import ChevronsLeft from '@assets/icons/ic_chevrons-left.svg';
import ChevronsRight from '@assets/icons/ic_chevrons-right.svg';

import { useSidebar } from './SidebarProvider';

type SidebarTriggerProps = Button.Props;

function SidebarTrigger({ className, onClick, ...props }: SidebarTriggerProps) {
  const { isOpen, isCompact, isOverlayOpen, panelId, toggleSidebar } =
    useSidebar();
  const isExpanded = isCompact ? isOverlayOpen : isOpen;

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
      <Image
        src={isExpanded ? ChevronsLeft : ChevronsRight}
        alt=""
        width={32}
        height={32}
        unoptimized
      />
    </Button>
  );
}

export { SidebarTrigger };
