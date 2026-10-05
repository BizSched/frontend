import type { ReactNode } from 'react';

interface PartTimeStaffAttachmentBoxProps {
  children: ReactNode;
}

function PartTimeStaffAttachmentBox({
  children,
}: PartTimeStaffAttachmentBoxProps) {
  return (
    <ul className="flex flex-col gap-2.5 rounded-[14px] bg-[#fafafa] px-4 py-3.5">
      {children}
    </ul>
  );
}

export { PartTimeStaffAttachmentBox };
export type { PartTimeStaffAttachmentBoxProps };
