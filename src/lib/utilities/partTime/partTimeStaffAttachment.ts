import type { PartTimeStaffAttachmentType } from '@lib/types/partTimeStaff';

const PART_TIME_STAFF_ATTACHMENT_MAX_COUNT = 10;
const PART_TIME_STAFF_ATTACHMENT_COUNT_MESSAGE = `첨부파일은 ${PART_TIME_STAFF_ATTACHMENT_MAX_COUNT}개까지 올릴 수 있어요.`;
const PART_TIME_STAFF_ATTACHMENT_MAX_BYTES = 3.5 * 1024 * 1024;
const PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE =
  '3.5MB 이하 파일만 올릴 수 있어요.';

const getPartTimeStaffAttachmentType = (
  contentType: string,
): PartTimeStaffAttachmentType | undefined => {
  const mimeType = contentType.split(';', 1)[0].trim().toLowerCase();
  if (mimeType === 'application/pdf') return 'pdf';
  if (
    mimeType === 'image/jpeg' ||
    mimeType === 'image/png' ||
    mimeType === 'image/webp'
  )
    return 'image';
  return undefined;
};

export {
  PART_TIME_STAFF_ATTACHMENT_COUNT_MESSAGE,
  PART_TIME_STAFF_ATTACHMENT_MAX_COUNT,
  PART_TIME_STAFF_ATTACHMENT_MAX_BYTES,
  PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE,
  getPartTimeStaffAttachmentType,
};
