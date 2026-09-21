'use client';

import { overlay } from 'overlay-kit';

import {
  ConfirmModal,
  type ConfirmModalProps,
} from '@components/_common/Modal/ConfirmModal';
import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

type ConfirmModalContent = Omit<
  ConfirmModalProps,
  'open' | 'onOpenChange' | 'onConfirm' | 'onExitComplete' | 'stackIndex'
>;

interface ConfirmModalControllerProps extends ConfirmModalContent {
  overlayId: string;
  isOpen: boolean;
  close: (isConfirmed: boolean) => void;
  unmount: () => void;
}

function ConfirmModalController({
  overlayId,
  isOpen,
  close,
  unmount,
  ...content
}: ConfirmModalControllerProps) {
  const stackIndex = useOverlayStackIndex(overlayId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close(false);
    }
  };

  return (
    <ConfirmModal
      {...content}
      stackIndex={stackIndex}
      open={isOpen}
      onOpenChange={handleOpenChange}
      onConfirm={() => close(true)}
      onExitComplete={unmount}
    />
  );
}

const openConfirmModal = (content: ConfirmModalContent) =>
  overlay.openAsync<boolean>(({ overlayId, isOpen, close, unmount }) => (
    <ConfirmModalController
      {...content}
      overlayId={overlayId}
      isOpen={isOpen}
      close={close}
      unmount={unmount}
    />
  ));

export { openConfirmModal };
export type { ConfirmModalContent };
