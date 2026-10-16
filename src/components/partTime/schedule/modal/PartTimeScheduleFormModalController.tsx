'use client';

import {
  PartTimeScheduleFormModal,
  type PartTimeScheduleFormModalProps,
  type PartTimeScheduleFormResult,
} from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';

import { useStaffOptions } from '@hooks/api/staff/useStaffOptions';
import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

import { getPartTimeScheduleStaffOptions } from '@lib/utilities/partTime/partTimeSchedule';

const getStaffPlaceholder = (
  isPending: boolean,
  isError: boolean,
  staffCount: number,
) => {
  if (isPending) return '아르바이트생 목록을 불러오는 중이에요';
  if (isError) return '아르바이트생 목록을 불러오지 못했어요';
  return staffCount === 0 ? '재직 중인 아르바이트생이 없어요' : undefined;
};

type PartTimeScheduleFormModalContent = Omit<
  PartTimeScheduleFormModalProps,
  | 'open'
  | 'onOpenChange'
  | 'onSubmit'
  | 'onExitComplete'
  | 'stackIndex'
  | 'staffs'
  | 'staffPlaceholder'
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
  const { data = [], isPending, isError } = useStaffOptions('EMPLOYED');
  const staffs = getPartTimeScheduleStaffOptions(data, content.schedule);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close(null);
    }
  };

  return (
    <PartTimeScheduleFormModal
      {...content}
      staffs={staffs}
      staffPlaceholder={getStaffPlaceholder(isPending, isError, staffs.length)}
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
