import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

function SidebarInset({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn(
        'relative flex min-w-0 flex-1 flex-col max-desktop:pl-15 max-tablet:pt-14 max-tablet:pl-0',
        className,
      )}
      {...props}
    />
  );
}

export { SidebarInset };
