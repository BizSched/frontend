import { FileUpIcon, XIcon } from 'lucide-react';

import { PartTimeStaffAttachmentBox } from '@components/partTime/staff/PartTimeStaffAttachmentBox';
import { PartTimeStaffAttachmentFile } from '@components/partTime/staff/PartTimeStaffAttachmentFile';

import type { PartTimeStaffFormAttachment } from '@lib/types/partTimeStaff';
import { cn } from '@lib/utilities/cn';
import { PART_TIME_STAFF_ATTACHMENT_MAX_COUNT } from '@lib/utilities/partTime/partTimeStaffAttachment';

const ROW_BUTTON_CLASS_NAME =
  'flex min-w-0 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface PartTimeStaffFormAttachmentsProps {
  attachments: PartTimeStaffFormAttachment[];
  isDisabled?: boolean;
  onUploadClick: () => void;
  onAttachmentOpen: (attachment: PartTimeStaffFormAttachment) => void;
  onAttachmentRemove: (attachment: PartTimeStaffFormAttachment) => void;
}

function PartTimeStaffFormAttachments({
  attachments,
  isDisabled = false,
  onUploadClick,
  onAttachmentOpen,
  onAttachmentRemove,
}: PartTimeStaffFormAttachmentsProps) {
  return (
    <PartTimeStaffAttachmentBox>
      <li
        className={cn(
          'flex',
          attachments.length > 0 && 'border-b border-[#e2e8f0] pb-2.5',
        )}
      >
        <button
          type="button"
          aria-label="첨부파일 업로드"
          aria-haspopup="dialog"
          disabled={
            isDisabled ||
            attachments.length >= PART_TIME_STAFF_ATTACHMENT_MAX_COUNT
          }
          onClick={onUploadClick}
          className={cn(ROW_BUTTON_CLASS_NAME, 'items-center gap-1')}
        >
          <FileUpIcon size={24} className="shrink-0 text-slate-400" />
          <span className="text-sm leading-5 font-semibold tracking-[-0.03em] text-white-950">
            첨부파일 ({attachments.length}/
            {PART_TIME_STAFF_ATTACHMENT_MAX_COUNT})
          </span>
        </button>
      </li>
      {attachments.map((attachment) => (
        <li
          key={attachment.key}
          className="flex items-center justify-between gap-2"
        >
          <button
            type="button"
            aria-label={`${attachment.name} 열기`}
            onClick={() => onAttachmentOpen(attachment)}
            className={ROW_BUTTON_CLASS_NAME}
          >
            <PartTimeStaffAttachmentFile name={attachment.name} />
          </button>
          <button
            type="button"
            aria-label={`${attachment.name} 삭제`}
            disabled={isDisabled}
            onClick={() => onAttachmentRemove(attachment)}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon size={24} strokeWidth={1.8} className="text-slate-300" />
          </button>
        </li>
      ))}
    </PartTimeStaffAttachmentBox>
  );
}

export { PartTimeStaffFormAttachments };
export type { PartTimeStaffFormAttachmentsProps };
