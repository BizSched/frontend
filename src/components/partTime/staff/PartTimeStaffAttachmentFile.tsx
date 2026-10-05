import Image from 'next/image';

import { cn } from '@lib/utilities/cn';

import IcUpload from '@assets/icons/ic_upload.svg';

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
      <Image
        src={IcUpload}
        alt=""
        width={24}
        height={24}
        className="shrink-0"
        unoptimized
      />
      <span
        className={cn(
          'truncate text-sm leading-5 font-medium tracking-[-0.03em] text-[#333333]',
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
