import { XIcon } from 'lucide-react';

import { PartTimeStaffAttachmentBox } from '@components/partTime/staff/PartTimeStaffAttachmentBox';
import { PartTimeStaffAttachmentFile } from '@components/partTime/staff/PartTimeStaffAttachmentFile';

import type { PartTimeStaffFormAttachment } from '@lib/types/partTimeStaff';
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
      <li className="flex">
        <button
          type="button"
          aria-label="첨부파일 업로드"
          aria-haspopup="dialog"
          disabled={
            isDisabled ||
            attachments.length >= PART_TIME_STAFF_ATTACHMENT_MAX_COUNT
          }
          onClick={onUploadClick}
          className={ROW_BUTTON_CLASS_NAME}
        >
          <PartTimeStaffAttachmentFile
            name="첨부파일"
            nameClassName="text-[#737373]"
          />
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
            <XIcon size={24} strokeWidth={1.8} className="text-[#A4A4A4]" />
          </button>
        </li>
      ))}
    </PartTimeStaffAttachmentBox>
  );
}

export { PartTimeStaffFormAttachments };
export type { PartTimeStaffFormAttachmentsProps };
