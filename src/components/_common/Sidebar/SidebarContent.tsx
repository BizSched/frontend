import type { ComponentProps } from 'react';

import { cn } from '@lib/utilities/cn';

function SidebarContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="sidebar-content"
      className={cn(
        'flex flex-1 flex-col gap-3 group-data-[state=collapsed]/sidebar:hidden',
        className,
      )}
      {...props}
    />
  );
}

export { SidebarContent };
