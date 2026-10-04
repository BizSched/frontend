'use client';

import {
  PartTimeScheduleFormModal,
  type PartTimeScheduleFormModalProps,
  type PartTimeScheduleFormResult,
} from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

type PartTimeScheduleFormModalContent = Omit<
  PartTimeScheduleFormModalProps,
  'open' | 'onOpenChange' | 'onSubmit' | 'onExitComplete' | 'stackIndex'
>;

interface PartTimeScheduleFormModalControllerProps extends PartTimeScheduleFormModalContent {
  overlayId: string;
  isOpen: boolean;
  close: (result: PartTimeScheduleFormResult | null) => void;
  unmount: () => void;
}

function PartTimeScheduleFormModalController({
  overlayId,
  isOpen,
  close,
  unmount,
  ...content
}: PartTimeScheduleFormModalControllerProps) {
  const stackIndex = useOverlayStackIndex(overlayId);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close(null);
    }
  };

  return (
    <PartTimeScheduleFormModal
      {...content}
      stackIndex={stackIndex}
      open={isOpen}
      onOpenChange={handleOpenChange}
      onSubmit={close}
      onExitComplete={unmount}
    />
  );
}

export { PartTimeScheduleFormModalController };
export type {
  PartTimeScheduleFormModalContent,
  PartTimeScheduleFormModalControllerProps,
};
