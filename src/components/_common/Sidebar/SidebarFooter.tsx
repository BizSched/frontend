import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

function SidebarFooter({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-footer"
      className={cn(
        'mt-auto flex shrink-0 flex-col gap-3 group-data-[state=collapsed]/sidebar:hidden',
        className,
      )}
      {...props}
    />
  );
}

export { SidebarFooter };
