import Image from 'next/image';

import { PartTimeStaffAttachmentBox } from '@components/partTime/staff/PartTimeStaffAttachmentBox';
import { PartTimeStaffAttachmentFile } from '@components/partTime/staff/PartTimeStaffAttachmentFile';

import type { PartTimeStaffFormAttachment } from '@lib/types/partTimeStaff';

import IcDelete from '@assets/icons/ic_delete.svg';

const ROW_BUTTON_CLASS_NAME =
  'flex min-w-0 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring';

interface PartTimeStaffFormAttachmentsProps {
  attachments: PartTimeStaffFormAttachment[];
  onUploadClick: () => void;
  onAttachmentOpen: (attachment: PartTimeStaffFormAttachment) => void;
  onAttachmentRemove: (attachment: PartTimeStaffFormAttachment) => void;
}

function PartTimeStaffFormAttachments({
  attachments,
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
            onClick={() => onAttachmentRemove(attachment)}
            className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src={IcDelete}
              alt=""
              width={13.8}
              height={13.8}
              unoptimized
            />
          </button>
        </li>
      ))}
    </PartTimeStaffAttachmentBox>
  );
}

export { PartTimeStaffFormAttachments };
export type { PartTimeStaffFormAttachmentsProps };
