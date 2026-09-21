'use client';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

import { ConfirmModal, type ConfirmModalProps } from './ConfirmModal';

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

export { ConfirmModalController };
export type { ConfirmModalContent, ConfirmModalControllerProps };
