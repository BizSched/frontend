'use client';

import { PartTimeStaffAttachmentUploadModal } from '@components/partTime/staff/PartTimeStaffAttachmentUploadModal';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

interface PartTimeStaffAttachmentUploadModalControllerProps {
  overlayId: string;
  isOpen: boolean;
  close: (file: File | null) => void;
  unmount: () => void;
}

function PartTimeStaffAttachmentUploadModalController({
  overlayId,
  isOpen,
  close,
  unmount,
}: PartTimeStaffAttachmentUploadModalControllerProps) {
  const stackIndex = useOverlayStackIndex(overlayId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close(null);
    }
  };

  return (
    <PartTimeStaffAttachmentUploadModal
      stackIndex={stackIndex}
      open={isOpen}
      onOpenChange={handleOpenChange}
      onUpload={close}
      onExitComplete={unmount}
    />
  );
}

export { PartTimeStaffAttachmentUploadModalController };
export type { PartTimeStaffAttachmentUploadModalControllerProps };
