'use client';

import { useId } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { DatePicker } from '@components/_common/DatePicker/DatePicker';
import { FormDropdown } from '@components/_common/FormDropdown/FormDropdown';
import { Input } from '@components/_common/Input/Input';
import { Modal } from '@components/_common/Modal/Modal';
import { PartTimeScheduleFormField } from '@components/partTime/schedule/modal/PartTimeScheduleFormField';
import { PartTimeScheduleQuickTimeSelect } from '@components/partTime/schedule/modal/PartTimeScheduleQuickTimeSelect';

import type {
  PartTimeSchedule,
  PartTimeStaff,
} from '@lib/types/partTimeSchedule';
import {
  formatCalendarDate,
  parseCalendarDate,
} from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';

const FORM_MODAL_TEXT = {
  create: { title: '아르바이트생 스케쥴 추가', submit: '생성' },
  edit: { title: '아르바이트생 스케쥴 수정', submit: '수정 완료' },
} as const;

const TIME_OPTIONS = Array.from({ length: 24 }, (_, hour) => {
  const time = `${String(hour).padStart(2, '0')}:00`;

  return { value: time, label: time };
});

const FIELD_CLASS_NAME =
  'h-14 w-full rounded-[16px] max-tablet:h-11 max-tablet:rounded-[12px] max-tablet:px-3 max-tablet:text-sm';

const DROPDOWN_CLASS_NAME = cn(
  FIELD_CLASS_NAME,
  'border border-slate-300 py-0 text-base font-normal tracking-[-0.02em] disabled:bg-slate-50 disabled:text-slate-500 max-tablet:[&_svg]:size-5',
);

const DROPDOWN_CONTENT_CLASS_NAME =
  'max-h-72 overflow-y-auto drop-shadow-[0px_4px_8px_rgba(0,0,0,0.1)]';

const FOOTER_BUTTON_CLASS_NAME =
  'w-auto min-w-0 max-tablet:h-12 max-tablet:py-3 max-tablet:text-base max-tablet:leading-6';

type PartTimeScheduleFormMode = keyof typeof FORM_MODAL_TEXT;

interface PartTimeScheduleFormValues {
  staffId: string;
  date: Date | undefined;
  startTime: string;
  endTime: string;
  memo: string;
}

interface PartTimeScheduleFormResult {
  staffId: number;
  date: string;
  startTime: string;
  endTime: string;
  memo: string;
}

interface PartTimeScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: PartTimeScheduleFormResult) => void;
  onExitComplete?: () => void;
  mode: PartTimeScheduleFormMode;
  schedule?: PartTimeSchedule;
  staffs: PartTimeStaff[];
  stackIndex?: number;
}

const getDefaultValues = (
  schedule?: PartTimeSchedule,
): PartTimeScheduleFormValues => ({
  staffId: schedule ? String(schedule.staff.id) : '',
  date: schedule ? parseCalendarDate(schedule.date) : undefined,
  startTime: schedule?.startTime ?? '',
  endTime: schedule?.endTime ?? '',
  memo: schedule?.memo ?? '',
});

function PartTimeScheduleFormModal({
  open,
  onOpenChange,
  onSubmit,
  onExitComplete,
  mode,
  schedule,
  staffs,
  stackIndex = 0,
}: PartTimeScheduleFormModalProps) {
  const fieldId = useId();
  const { control, register, setValue, handleSubmit, formState } =
    useForm<PartTimeScheduleFormValues>({
      mode: 'onChange',
      defaultValues: getDefaultValues(schedule),
    });
  const [startTime, endTime] = useWatch({
    control,
    name: ['startTime', 'endTime'],
  });

  const text = FORM_MODAL_TEXT[mode];
  const staffOptions = staffs.map((staff) => ({
    value: String(staff.id),
    label: staff.name,
  }));

  const handleQuickTimeSelect = (
    nextStartTime: string,
    nextEndTime: string,
  ) => {
    setValue('startTime', nextStartTime, { shouldValidate: true });
    setValue('endTime', nextEndTime, { shouldValidate: true });
  };

  const handleFormSubmit = (values: PartTimeScheduleFormValues) => {
    if (!values.date) {
      return;
    }

    onSubmit({
      staffId: Number(values.staffId),
      date: formatCalendarDate(values.date),
      startTime: values.startTime,
      endTime: values.endTime,
      memo: values.memo.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={(isOpened) => {
        if (!isOpened) {
          onExitComplete?.();
        }
      }}
      stackIndex={stackIndex}
    >
      <Modal.Panel
        size="md"
        placement="sheetOnMobile"
        className="gap-8 max-tablet:gap-4"
      >
        <Modal.Header align="start">
          <Modal.Title className="max-tablet:text-xl">{text.title}</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <form
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="flex min-h-0 flex-1 flex-col gap-10 max-tablet:gap-4"
        >
          <Modal.Body className="-m-1 flex flex-col gap-4 p-1 max-tablet:gap-3">
            <PartTimeScheduleFormField
              label="아르바이트생 이름"
              labelId={`${fieldId}-staff`}
              isRequired
            >
              <Controller
                control={control}
                name="staffId"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormDropdown
                    value={field.value || undefined}
                    options={staffOptions}
                    onChange={field.onChange}
                    placeholder="아르바이트생을 선택해주세요"
                    disabled={mode === 'edit'}
                    className={DROPDOWN_CLASS_NAME}
                    hasDivider={false}
                    contentClassName={DROPDOWN_CONTENT_CLASS_NAME}
                  />
                )}
              />
            </PartTimeScheduleFormField>
            <PartTimeScheduleFormField
              label="근무 날짜"
              labelId={`${fieldId}-date`}
              isRequired
            >
              <Controller
                control={control}
                name="date"
                rules={{ required: true }}
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="근무 날짜를 선택해주세요"
                    className={FIELD_CLASS_NAME}
                  />
                )}
              />
            </PartTimeScheduleFormField>
            <PartTimeScheduleFormField
              label="근무 시작 시간"
              labelId={`${fieldId}-start-time`}
              isRequired
            >
              <Controller
                control={control}
                name="startTime"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormDropdown
                    value={field.value || undefined}
                    options={TIME_OPTIONS}
                    onChange={field.onChange}
                    placeholder="근무 시작 시간을 선택해주세요"
                    className={DROPDOWN_CLASS_NAME}
                    hasDivider={false}
                    contentClassName={DROPDOWN_CONTENT_CLASS_NAME}
                  />
                )}
              />
            </PartTimeScheduleFormField>
            <PartTimeScheduleFormField
              label="근무 마감 시간"
              labelId={`${fieldId}-end-time`}
              isRequired
            >
              <Controller
                control={control}
                name="endTime"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormDropdown
                    value={field.value || undefined}
                    options={TIME_OPTIONS}
                    onChange={field.onChange}
                    placeholder="근무 마감 시간을 선택해주세요"
                    className={DROPDOWN_CLASS_NAME}
                    hasDivider={false}
                    contentClassName={DROPDOWN_CONTENT_CLASS_NAME}
                  />
                )}
              />
            </PartTimeScheduleFormField>
            <PartTimeScheduleFormField
              label="빠른 선택"
              labelId={`${fieldId}-quick-time`}
            >
              <PartTimeScheduleQuickTimeSelect
                startTime={startTime}
                endTime={endTime}
                onSelect={handleQuickTimeSelect}
              />
            </PartTimeScheduleFormField>
            <PartTimeScheduleFormField label="메모" labelId={`${fieldId}-memo`}>
              <Input
                aria-labelledby={`${fieldId}-memo`}
                placeholder="간단한 메모를 작성해주세요"
                className={cn(
                  FIELD_CLASS_NAME,
                  '[&_input]:placeholder:text-muted-foreground',
                )}
                {...register('memo')}
              />
            </PartTimeScheduleFormField>
          </Modal.Body>
          <Modal.Footer layout="split" className="max-tablet:gap-2">
            <Modal.CloseButton
              render={
                <Button
                  type="button"
                  hierarchy="tertiary"
                  className={cn(
                    FOOTER_BUTTON_CLASS_NAME,
                    'text-muted-foreground',
                  )}
                />
              }
            >
              취소
            </Modal.CloseButton>
            <Button
              type="submit"
              disabled={!formState.isValid}
              focusableWhenDisabled
              className={cn(
                FOOTER_BUTTON_CLASS_NAME,
                'data-disabled:cursor-not-allowed data-disabled:bg-[#bbbbbb] data-disabled:hover:bg-[#bbbbbb]',
              )}
            >
              {text.submit}
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Panel>
    </Modal>
  );
}

export { PartTimeScheduleFormModal };
export type {
  PartTimeScheduleFormModalProps,
  PartTimeScheduleFormMode,
  PartTimeScheduleFormResult,
};
