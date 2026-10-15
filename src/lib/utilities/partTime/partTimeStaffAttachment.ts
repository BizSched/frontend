import type { PartTimeStaffAttachmentType } from '@lib/types/partTimeStaff';

const getPartTimeStaffAttachmentType = (
  contentType: string,
): PartTimeStaffAttachmentType | undefined => {
  const mimeType = contentType.split(';', 1)[0].trim().toLowerCase();
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'image/jpeg' || mimeType === 'image/png') return 'image';
  return undefined;
};

export { getPartTimeStaffAttachmentType };
