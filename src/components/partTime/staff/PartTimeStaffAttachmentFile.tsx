import { FileTextIcon } from 'lucide-react';

interface PartTimeStaffAttachmentFileProps {
  name: string;
}

function PartTimeStaffAttachmentFile({
  name,
}: PartTimeStaffAttachmentFileProps) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <FileTextIcon size={24} className="shrink-0 text-slate-400" />
      <span className="truncate text-sm leading-5 font-medium tracking-[-0.03em] text-slate-500">
        {name}
      </span>
    </span>
  );
}

export { PartTimeStaffAttachmentFile };
export type { PartTimeStaffAttachmentFileProps };
