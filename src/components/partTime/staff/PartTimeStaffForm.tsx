'use client';

import { useRouter } from 'next/navigation';
import {
  type ChangeEvent,
  type SyntheticEvent,
  useEffect,
  useId,
  useState,
} from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { RadioGroup } from '@components/_common/Radio/RadioGroup';
import { RadioGroupItem } from '@components/_common/Radio/RadioGroupItem';
import { openPartTimeStaffAttachmentUploadModal } from '@components/partTime/staff/openPartTimeStaffAttachmentUploadModal';
import { PartTimeStaffAttachmentViewer } from '@components/partTime/staff/PartTimeStaffAttachmentViewer';
import { PartTimeStaffFieldRow } from '@components/partTime/staff/PartTimeStaffFieldRow';
import { PartTimeStaffFormAttachments } from '@components/partTime/staff/PartTimeStaffFormAttachments';
import { PartTimeStaffNoteIcon } from '@components/partTime/staff/PartTimeStaffNoteIcon';
import { PartTimeStaffProfileLayout } from '@components/partTime/staff/PartTimeStaffProfileLayout';

import type {
  PartTimeStaffDetailItem,
  PartTimeStaffFormAttachment,
  PartTimeStaffFormValues,
  PartTimeStaffInputDeleteDirection,
} from '@lib/types/partTimeStaff';
import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';
import {
  PART_TIME_STAFF_NAME_MAX_LENGTH,
  applyPartTimeStaffInputFormat,
  countPartTimeStaffCharacters,
  countPartTimeStaffMemoLength,
  createPartTimeStaffFormNewAttachment,
  formatPartTimeStaffBirthDateInput,
  formatPartTimeStaffHourlyWageInput,
  formatPartTimeStaffPhoneInput,
  isPartTimeStaffBirthDateValid,
  isPartTimeStaffFormChanged,
  isPartTimeStaffNameValid,
  isPartTimeStaffPhoneValid,
  limitPartTimeStaffName,
  toPartTimeStaffFormValues,
} from '@lib/utilities/partTime/partTimeStaffForm';

const FORM_TEXT = {
  create: {
    title: '아르바이트생 등록하기',
    submit: '등록하기',
    shortSubmit: '등록',
  },
  edit: {
    title: '아르바이트생 정보 수정하기',
    submit: '수정하기',
    shortSubmit: '수정',
  },
} as const;

const GENDER_OPTIONS = [
  { value: 'female', label: '여성' },
  { value: 'male', label: '남성' },
] as const;

const STAFF_LIST_PATH = '/partTime/staff';

const VIEWER_SPACE_CLASS_NAME =
  'max-laptop:pb-[calc(417px+2.375rem+1.5rem)] max-tablet:pb-[calc(14.375rem+1.75rem+1rem)]';

const FIELD_INPUT_CLASS_NAME =
  'w-full min-w-0 bg-transparent outline-none placeholder:text-slate-200';

const FORM_FIELD_NAMES = [
  'name',
  'birthDate',
  'gender',
  'phone',
  'hourlyWage',
  'attachments',
  'memo',
] as const;

const DELETE_DIRECTIONS: Partial<
  Record<string, PartTimeStaffInputDeleteDirection>
> = {
  deleteContentBackward: 'backward',
  deleteContentForward: 'forward',
};

interface FormattedInputField {
  value: string;
  onChange: (value: string) => void;
}

const isComposingInput = (event: SyntheticEvent) =>
  'isComposing' in event.nativeEvent && event.nativeEvent.isComposing === true;

const createFormattedInputChangeHandler =
  (field: FormattedInputField, format: (value: string) => string) =>
  (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const { nativeEvent } = event;
    const formattedInput = applyPartTimeStaffInputFormat(
      {
        value: input.value,
        caret: input.selectionStart ?? input.value.length,
        previousValue: field.value,
        deleteDirection:
          'inputType' in nativeEvent
            ? DELETE_DIRECTIONS[String(nativeEvent.inputType)]
            : undefined,
      },
      format,
    );

    input.value = formattedInput.value;
    input.setSelectionRange(formattedInput.caret, formattedInput.caret);
    field.onChange(formattedInput.value);
  };

interface PartTimeStaffFormProps {
  staff?: PartTimeStaffDetailItem;
}

function PartTimeStaffForm({ staff }: PartTimeStaffFormProps) {
  const formId = useId();
  const router = useRouter();
  const [initialValues] = useState(() => toPartTimeStaffFormValues(staff));
  const { control, register, handleSubmit, formState, getValues, setValue } =
    useForm<PartTimeStaffFormValues>({
      mode: 'onChange',
      defaultValues: initialValues,
    });
  const [name, birthDate, gender, phone, hourlyWage, attachments, memo] =
    useWatch({
      control,
      name: FORM_FIELD_NAMES,
    });
  const values: PartTimeStaffFormValues = {
    name,
    birthDate,
    gender,
    phone,
    hourlyWage,
    attachments,
    memo,
  };
  const [previewKey, setPreviewKey] = useState<string>();
  const [isViewerCollapsed, setIsViewerCollapsed] = useState(false);

  const previewAttachment = attachments.find(
    (attachment) => attachment.key === previewKey,
  );

  useEffect(
    () => () => {
      getValues('attachments').forEach((attachment) => {
        if (attachment.kind === 'new') {
          URL.revokeObjectURL(attachment.url);
        }
      });
    },
    [getValues],
  );

  const text = FORM_TEXT[staff ? 'edit' : 'create'];
  const nameLength = Math.min(
    countPartTimeStaffCharacters(name),
    PART_TIME_STAFF_NAME_MAX_LENGTH,
  );
  const memoLength = countPartTimeStaffMemoLength(memo);
  const isSubmitDisabled =
    !formState.isValid ||
    (staff !== undefined && !isPartTimeStaffFormChanged(values, initialValues));

  const handleUploadClick = async () => {
    const file = await openPartTimeStaffAttachmentUploadModal();

    if (!file) {
      return;
    }

    const url = URL.createObjectURL(file);
    const attachment = createPartTimeStaffFormNewAttachment(file, url);

    if (!attachment) {
      URL.revokeObjectURL(url);
      return;
    }

    setValue('attachments', [...getValues('attachments'), attachment], {
      shouldDirty: true,
    });
  };

  const handleAttachmentOpen = (attachment: PartTimeStaffFormAttachment) => {
    setPreviewKey(attachment.key);
    setIsViewerCollapsed(false);
  };

  const handleAttachmentRemove = (attachment: PartTimeStaffFormAttachment) => {
    if (attachment.kind === 'new') {
      URL.revokeObjectURL(attachment.url);
    }

    setValue(
      'attachments',
      getValues('attachments').filter(({ key }) => key !== attachment.key),
      { shouldDirty: true },
    );
  };

  const handleFormSubmit = () => {
    router.replace(
      staff ? `${STAFF_LIST_PATH}?staffId=${staff.id}` : STAFF_LIST_PATH,
    );
  };

  return (
    <div className="flex min-w-0 flex-1">
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col px-6 pt-25 pb-13 max-desktop:pt-12 max-laptop:pb-6 max-tablet:px-4 max-tablet:pt-3 max-tablet:pb-4 laptop:basis-200',
          previewAttachment && !isViewerCollapsed && VIEWER_SPACE_CLASS_NAME,
        )}
      >
        <form
          id={formId}
          noValidate
          onSubmit={handleSubmit(handleFormSubmit)}
          className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 max-tablet:gap-3"
        >
          <div className="flex items-center justify-between gap-2.5 px-2 max-tablet:px-1">
            <h1 className="min-w-0 text-2xl leading-8 font-semibold tracking-[-0.03em] break-keep text-black max-laptop:text-xl max-laptop:leading-7.5 max-tablet:text-base max-tablet:leading-6 max-tablet:text-[#333333]">
              {text.title}
            </h1>
            <Button
              type="submit"
              size="small"
              disabled={isSubmitDisabled}
              focusableWhenDisabled
              className="h-10 w-26.5 max-tablet:h-auto max-tablet:w-auto max-tablet:bg-transparent max-tablet:px-1.5 max-tablet:py-0.5 max-tablet:text-[#333333] max-tablet:hover:bg-transparent data-disabled:cursor-not-allowed data-disabled:bg-[#bbbbbb] data-disabled:hover:bg-[#bbbbbb] max-tablet:data-disabled:bg-transparent max-tablet:data-disabled:text-[#a4a4a4] max-tablet:data-disabled:hover:bg-transparent"
            >
              <span className="max-tablet:hidden">{text.submit}</span>
              <span className="hidden max-tablet:inline">
                {text.shortSubmit}
              </span>
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-[32px] bg-white px-8.5 py-8 max-laptop:px-7.5 max-tablet:rounded-[24px] max-tablet:p-4">
            <PartTimeStaffProfileLayout
              className="flex-1"
              title={
                <div className="flex items-center gap-3">
                  <PartTimeStaffNoteIcon />
                  <Controller
                    control={control}
                    name="name"
                    rules={{ validate: isPartTimeStaffNameValid }}
                    render={({ field }) => (
                      <input
                        {...field}
                        aria-label="아르바이트생 이름"
                        aria-required
                        autoComplete="off"
                        placeholder="아르바이트생 이름을 입력해주세요"
                        className="min-w-0 flex-1 bg-transparent text-2xl leading-8 font-semibold tracking-[-0.03em] text-[#333333] outline-none placeholder:text-[#bbbbbb] max-tablet:text-base max-tablet:leading-6"
                        onChange={(event) => {
                          const { value } = event.currentTarget;

                          field.onChange(
                            isComposingInput(event)
                              ? value
                              : limitPartTimeStaffName(value),
                          );
                        }}
                        onCompositionEnd={(event) =>
                          field.onChange(
                            limitPartTimeStaffName(event.currentTarget.value),
                          )
                        }
                      />
                    )}
                  />
                  <p className="shrink-0 text-xs leading-4 font-medium text-[#737373]">
                    {nameLength}/
                    <span className="text-primary-600">
                      {PART_TIME_STAFF_NAME_MAX_LENGTH}
                    </span>
                  </p>
                </div>
              }
              fields={
                <>
                  <PartTimeStaffFieldRow label="생년월일">
                    <Controller
                      control={control}
                      name="birthDate"
                      rules={{
                        validate: (value) =>
                          isPartTimeStaffBirthDateValid(
                            value,
                            formatCalendarDate(new Date()),
                          ),
                      }}
                      render={({ field }) => (
                        <input
                          {...field}
                          aria-label="생년월일"
                          inputMode="numeric"
                          autoComplete="bday"
                          placeholder="2XXX.XX.XX"
                          className={FIELD_INPUT_CLASS_NAME}
                          onChange={createFormattedInputChangeHandler(
                            field,
                            formatPartTimeStaffBirthDateInput,
                          )}
                        />
                      )}
                    />
                  </PartTimeStaffFieldRow>
                  <PartTimeStaffFieldRow label="성별">
                    <Controller
                      control={control}
                      name="gender"
                      render={({ field }) => (
                        <RadioGroup
                          aria-label="성별"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="flex h-6 items-center gap-4"
                        >
                          {GENDER_OPTIONS.map(({ value, label }) => (
                            <label
                              key={value}
                              className="flex cursor-pointer items-center gap-1.5"
                            >
                              <RadioGroupItem value={value} size="small" />
                              {label}
                            </label>
                          ))}
                        </RadioGroup>
                      )}
                    />
                  </PartTimeStaffFieldRow>
                  <PartTimeStaffFieldRow label="번호">
                    <Controller
                      control={control}
                      name="phone"
                      rules={{ validate: isPartTimeStaffPhoneValid }}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          aria-label="번호"
                          aria-required
                          inputMode="numeric"
                          autoComplete="tel"
                          placeholder="010-XXXX-XXXX"
                          className={FIELD_INPUT_CLASS_NAME}
                          onChange={createFormattedInputChangeHandler(
                            field,
                            formatPartTimeStaffPhoneInput,
                          )}
                        />
                      )}
                    />
                  </PartTimeStaffFieldRow>
                  <PartTimeStaffFieldRow label="시급">
                    <Controller
                      control={control}
                      name="hourlyWage"
                      render={({ field }) => (
                        <label className="flex cursor-text items-center gap-1">
                          <span className="relative min-w-0">
                            <span
                              aria-hidden
                              className="invisible block pr-px whitespace-pre"
                            >
                              {field.value || '-'}
                            </span>
                            <input
                              {...field}
                              aria-label="시급"
                              inputMode="numeric"
                              autoComplete="off"
                              placeholder="-"
                              className={cn(
                                FIELD_INPUT_CLASS_NAME,
                                'absolute inset-0',
                              )}
                              onChange={createFormattedInputChangeHandler(
                                field,
                                formatPartTimeStaffHourlyWageInput,
                              )}
                            />
                          </span>
                          <span
                            className={cn(!field.value && 'text-slate-200')}
                          >
                            원
                          </span>
                        </label>
                      )}
                    />
                  </PartTimeStaffFieldRow>
                </>
              }
              attachments={
                <PartTimeStaffFormAttachments
                  attachments={attachments}
                  onUploadClick={handleUploadClick}
                  onAttachmentOpen={handleAttachmentOpen}
                  onAttachmentRemove={handleAttachmentRemove}
                />
              }
              body={
                <textarea
                  aria-label="메모"
                  placeholder="이 곳을 통해 메모를 작성해주세요"
                  className="min-h-50 w-full flex-1 resize-none bg-transparent text-sm leading-5 tracking-[-0.03em] text-[#333333] outline-none placeholder:text-base placeholder:leading-6 placeholder:tracking-[-0.02em] placeholder:text-[#a4a4a4] max-tablet:placeholder:text-sm max-tablet:placeholder:leading-5 max-tablet:placeholder:tracking-[-0.03em]"
                  {...register('memo')}
                />
              }
            />
            <p className="text-right text-xs leading-4 text-[#a4a4a4]">
              공백포함 {memoLength.withSpaces}자 | 공백제외{' '}
              {memoLength.withoutSpaces}자
            </p>
          </div>
        </form>
      </div>
      {previewAttachment && (
        <div className="z-10 flex max-laptop:fixed max-laptop:inset-x-0 max-laptop:bottom-0 max-laptop:flex-col laptop:sticky laptop:top-0 laptop:h-dvh laptop:min-w-0 laptop:shrink laptop:self-start">
          <PartTimeStaffAttachmentViewer
            key={previewAttachment.key}
            attachment={previewAttachment}
            isCollapsed={isViewerCollapsed}
            onCollapsedChange={setIsViewerCollapsed}
          />
        </div>
      )}
    </div>
  );
}

export { PartTimeStaffForm };
export type { PartTimeStaffFormProps };
