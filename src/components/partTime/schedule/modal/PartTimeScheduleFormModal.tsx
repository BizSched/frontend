'use client';

import { type ChangeEvent, useId } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { DatePicker } from '@components/_common/DatePicker/DatePicker';
import { FormDropdown } from '@components/_common/FormDropdown/FormDropdown';
import { Modal } from '@components/_common/Modal/Modal';
import { PartTimeScheduleFormField } from '@components/partTime/schedule/modal/PartTimeScheduleFormField';
import { PartTimeScheduleQuickTimeSelect } from '@components/partTime/schedule/modal/PartTimeScheduleQuickTimeSelect';

import type {
  PartTimeSchedule,
  PartTimeScheduleFormResult,
  PartTimeStaff,
} from '@lib/types/partTimeSchedule';
import {
  formatCalendarDate,
  parseCalendarDate,
} from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';
import { getPartTimeScheduleChanges } from '@lib/utilities/partTime/partTimeScheduleForm';
import {
  PART_TIME_MEMO_MAX_LENGTH,
  countPartTimeMemoLength,
  isComposingInput,
  limitPartTimeMemo,
} from '@lib/utilities/partTime/partTimeTextInput';

const STAFF_PLACEHOLDER = '아르바이트생을 선택해주세요';

const END_TIME_ERROR_MESSAGE = '마감 시간은 시작 시간보다 늦게 선택해주세요.';

const FORM_MODAL_TEXT = {
  create: { title: '아르바이트생 스케줄 추가', submit: '생성' },
  edit: { title: '아르바이트생 스케줄 수정', submit: '수정 완료' },
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

const MEMO_FRAME_CLASS_NAME =
  'flex min-h-30 w-full flex-col rounded-[16px] border border-slate-300 bg-white-50 p-4 transition-colors focus-within:ring-2 focus-within:ring-primary-500 has-[:disabled]:cursor-not-allowed has-[:disabled]:bg-slate-50 max-tablet:min-h-24 max-tablet:rounded-[12px] max-tablet:p-3';

const MEMO_CLASS_NAME =
  'w-full flex-1 resize-none bg-transparent field-sizing-content text-base tracking-[-0.02em] text-slate-700 outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:text-slate-500 max-tablet:text-sm max-tablet:tracking-[-0.03em]';

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

interface PartTimeScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (result: PartTimeScheduleFormResult) => void | Promise<void>;
  onExitComplete?: () => void;
  mode: PartTimeScheduleFormMode;
  schedule?: PartTimeSchedule;
  staffs: PartTimeStaff[];
  staffPlaceholder?: string;
  stackIndex?: number;
  isPending?: boolean;
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
  staffPlaceholder = STAFF_PLACEHOLDER,
  stackIndex = 0,
  isPending = false,
}: PartTimeScheduleFormModalProps) {
  const fieldId = useId();
  const { control, register, setValue, handleSubmit, formState } =
    useForm<PartTimeScheduleFormValues>({
      mode: 'onChange',
      defaultValues: getDefaultValues(schedule),
    });
  const [staffId, date, startTime, endTime, memo] = useWatch({
    control,
    name: ['staffId', 'date', 'startTime', 'endTime', 'memo'],
  });

  const { isValid, isSubmitting } = formState;
  const isLocked = isPending || isSubmitting;
  const hasChanges =
    !!schedule &&
    !!date &&
    getPartTimeScheduleChanges(
      {
        staffId: Number(staffId),
        date: formatCalendarDate(date),
        startTime,
        endTime,
        memo,
      },
      schedule,
    ) !== null;
  const memoLength = countPartTimeMemoLength(memo);
  const text = FORM_MODAL_TEXT[mode];
  const isEndTimeInvalid = !!startTime && !!endTime && endTime <= startTime;
  const isSubmitDisabled =
    !isValid ||
    !startTime ||
    !endTime ||
    isEndTimeInvalid ||
    (mode === 'edit' && !hasChanges) ||
    isLocked;
  const staffOptions = staffs.map((staff) => ({
    value: String(staff.id),
    label: staff.name,
  }));

  const handleQuickTimeSelect = (
    nextStartTime: string,
    nextEndTime: string,
  ) => {
    if (isLocked) return;
    setValue('startTime', nextStartTime, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue('endTime', nextEndTime, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleFormSubmit = async (values: PartTimeScheduleFormValues) => {
    if (!values.date || isSubmitDisabled) {
      return;
    }

    await onSubmit({
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
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && isLocked) {
          details.cancel();
          return;
        }
        onOpenChange(nextOpen);
      }}
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
          <Modal.CloseButton disabled={isLocked} />
        </Modal.Header>
        <form
          noValidate
          aria-busy={isLocked}
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
                    disabled={isLocked || mode === 'edit'}
                    value={field.value || undefined}
                    options={staffOptions}
                    onChange={field.onChange}
                    placeholder={staffPlaceholder}
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
                    disabled={isLocked}
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
                    disabled={isLocked}
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
              errorMessage={
                isEndTimeInvalid ? END_TIME_ERROR_MESSAGE : undefined
              }
            >
              <Controller
                control={control}
                name="endTime"
                rules={{ required: true }}
                render={({ field }) => (
                  <FormDropdown
                    disabled={isLocked}
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
                isDisabled={isLocked}
                startTime={startTime}
                endTime={endTime}
                onSelect={handleQuickTimeSelect}
              />
            </PartTimeScheduleFormField>
            <PartTimeScheduleFormField label="메모" labelId={`${fieldId}-memo`}>
              <div className={MEMO_FRAME_CLASS_NAME}>
                <textarea
                  disabled={isLocked}
                  aria-labelledby={`${fieldId}-memo`}
                  aria-describedby={`${fieldId}-memo-length`}
                  placeholder="간단한 메모를 작성해주세요"
                  className={MEMO_CLASS_NAME}
                  {...register('memo', {
                    maxLength: PART_TIME_MEMO_MAX_LENGTH,
                    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => {
                      if (!isComposingInput(event)) {
                        setValue(
                          'memo',
                          limitPartTimeMemo(event.currentTarget.value),
                          { shouldValidate: true },
                        );
                      }
                    },
                  })}
                  onCompositionEnd={(event) =>
                    setValue(
                      'memo',
                      limitPartTimeMemo(event.currentTarget.value),
                      { shouldValidate: true, shouldDirty: true },
                    )
                  }
                />
              </div>
              <p
                id={`${fieldId}-memo-length`}
                className="-mt-1 px-1 text-right text-xs leading-4 text-slate-300"
              >
                공백포함 {memoLength.withSpaces}자 | 공백제외{' '}
                {memoLength.withoutSpaces}자
              </p>
            </PartTimeScheduleFormField>
          </Modal.Body>
          <Modal.Footer layout="split" className="max-tablet:gap-2">
            <Modal.CloseButton
              disabled={isLocked}
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
              disabled={isSubmitDisabled}
              focusableWhenDisabled
              className={FOOTER_BUTTON_CLASS_NAME}
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
export type { PartTimeScheduleFormModalProps, PartTimeScheduleFormMode };
