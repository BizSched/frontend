import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

function SidebarHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn('flex shrink-0 flex-col gap-8', className)}
      {...props}
    />
  );
}

export { SidebarHeader };
