'use client';

import { TermsModal, type TermsModalProps } from '@components/auth/TermsModal';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

type TermsModalContent = Pick<TermsModalProps, 'document'>;

interface TermsModalControllerProps extends TermsModalContent {
  overlayId: string;
  isOpen: boolean;
  close: (isAgreed: boolean) => void;
  unmount: () => void;
}

function TermsModalController({
  overlayId,
  isOpen,
  close,
  unmount,
  ...content
}: TermsModalControllerProps) {
  const stackIndex = useOverlayStackIndex(overlayId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close(false);
    }
  };

  return (
    <TermsModal
      {...content}
      stackIndex={stackIndex}
      open={isOpen}
      onOpenChange={handleOpenChange}
      onAgree={() => close(true)}
      onExitComplete={unmount}
    />
  );
}

export { TermsModalController };
export type { TermsModalContent, TermsModalControllerProps };
