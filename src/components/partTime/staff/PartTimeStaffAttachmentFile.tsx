import { FileUpIcon } from 'lucide-react';

import { cn } from '@lib/utilities/cn';
import { typographyVariants } from '@lib/utilities/typography';

interface PartTimeStaffAttachmentFileProps {
  name: string;
  nameClassName?: string;
}

function PartTimeStaffAttachmentFile({
  name,
  nameClassName,
}: PartTimeStaffAttachmentFileProps) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <FileUpIcon size={24} className="shrink-0 text-slate-400" />
      <span
        className={cn(
          typographyVariants({ role: 'body' }),
          'truncate text-slate-500',
          nameClassName,
        )}
      >
        {name}
      </span>
    </span>
  );
}

export { PartTimeStaffAttachmentFile };
export type { PartTimeStaffAttachmentFileProps };
