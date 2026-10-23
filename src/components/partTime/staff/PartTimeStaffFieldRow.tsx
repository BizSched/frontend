import type { ReactNode } from 'react';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface PartTimeStaffFieldRowProps {
  label: string;
  children: ReactNode;
}

function PartTimeStaffFieldRow({
  label,
  children,
}: PartTimeStaffFieldRowProps) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <dt
        className={cn(
          typographyVariants({ role: 'label' }),
          'flex h-6 w-14 shrink-0 items-center text-slate-300',
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          typographyVariants({ role: 'body' }),
          'min-w-0 flex-1 wrap-break-word text-slate-500',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export { PartTimeStaffFieldRow };
export type { PartTimeStaffFieldRowProps };
