'use client';

import { useRef } from 'react';

import { toast } from '@components/_common/Toast/Toaster';
import {
  PartTimeScheduleFormModal,
  type PartTimeScheduleFormModalProps,
} from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';

import { useCreateSchedule } from '@hooks/api/schedule/useCreateSchedule';
import { useUpdateSchedule } from '@hooks/api/schedule/useUpdateSchedule';
import { useStaffOptions } from '@hooks/api/staff/useStaffOptions';
import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

import { formatCommonError } from '@lib/api/formatCommonError';
import type { PartTimeScheduleFormResult } from '@lib/types/partTimeSchedule';
import { getPartTimeScheduleStaffOptions } from '@lib/utilities/partTime/partTimeSchedule';
import { getPartTimeScheduleChanges } from '@lib/utilities/partTime/partTimeScheduleForm';

const SAVE_ERROR_TOAST_ID = 'schedule-save-error';

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
  | 'isPending'
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
  const isSubmittingRef = useRef(false);
  const createMutation = useCreateSchedule();
  const updateMutation = useUpdateSchedule();
  const mutation = content.mode === 'edit' ? updateMutation : createMutation;
  const { data = [], isPending, isError } = useStaffOptions('EMPLOYED');
  const staffs = getPartTimeScheduleStaffOptions(data, content.schedule);

  const handleOpenChange = (open: boolean) => {
    if (!open && !isSubmittingRef.current) {
      close(null);
    }
  };

  const handleSubmit = async (result: PartTimeScheduleFormResult) => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    toast.dismiss(SAVE_ERROR_TOAST_ID);

    try {
      const { date, ...fields } = result;
      if (content.mode === 'edit') {
        const { schedule } = content;
        if (!schedule) return;
        const changes = getPartTimeScheduleChanges(result, schedule);
        if (!changes) return;
        const { date: changedDate, ...changedFields } = changes;
        await updateMutation.mutateAsync({
          scheduleId: schedule.id,
          body: {
            ...changedFields,
            ...(changedDate ? { workDate: changedDate } : {}),
          },
        });
      } else {
        await createMutation.mutateAsync({ ...fields, workDate: date });
      }
      close(result);
    } catch (error) {
      toast.error(formatCommonError(error), { id: SAVE_ERROR_TOAST_ID });
    } finally {
      isSubmittingRef.current = false;
    }
  };

  return (
    <PartTimeScheduleFormModal
      {...content}
      staffs={staffs}
      staffPlaceholder={getStaffPlaceholder(isPending, isError, staffs.length)}
      stackIndex={stackIndex}
      open={isOpen}
      isPending={mutation.isPending}
      onOpenChange={handleOpenChange}
      onSubmit={handleSubmit}
      onExitComplete={unmount}
    />
  );
}

export { PartTimeScheduleFormModalController };
export type {
  PartTimeScheduleFormModalContent,
  PartTimeScheduleFormModalControllerProps,
};
