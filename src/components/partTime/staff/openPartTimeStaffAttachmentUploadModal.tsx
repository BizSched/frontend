'use client';

import { overlay } from 'overlay-kit';

import { PartTimeStaffAttachmentUploadModalController } from '@components/partTime/staff/PartTimeStaffAttachmentUploadModalController';

let isUploadModalOpen = false;

const openPartTimeStaffAttachmentUploadModal = async () => {
  if (isUploadModalOpen) {
    return null;
  }

  isUploadModalOpen = true;

  try {
    return await overlay.openAsync<File | null>((controller) => (
      <PartTimeStaffAttachmentUploadModalController {...controller} />
    ));
  } finally {
    isUploadModalOpen = false;
  }
};

export { openPartTimeStaffAttachmentUploadModal };
