'use client';

import { CalendarDaysIcon, InfoIcon } from 'lucide-react';
import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { DatePicker } from '@components/_common/DatePicker/DatePicker';
import { Input } from '@components/_common/Input/Input';
import { Modal } from '@components/_common/Modal/Modal';
import { toast } from '@components/_common/Toast/Toaster';

import { useCreateSale } from '@hooks/api/sales/useCreateSale';
import { useSalesCategoryList } from '@hooks/api/sales-category/useSalesCategoryList';
import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';
import { cn } from '@lib/utilities/cn';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';
import { typographyVariants } from '@lib/utilities/typography';

const NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');

// NOTE: 카테고리를 마운트 뒤에 받으면 기본값 없이 등록된 입력은 undefined로 시작한다
const normalizeAmount = (value = '') => value.replaceAll(',', '').trim();

interface SalesEntryFormValues {
  date: Date;
  amounts: { value: string }[];
}

interface SalesEntryModalProps {
  overlayId: string;
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
  returnFocus: HTMLElement;
}

function SalesEntryModal({
  overlayId,
  isOpen,
  close,
  unmount,
  returnFocus,
}: SalesEntryModalProps) {
  const stackIndex = useOverlayStackIndex(overlayId);
  const panelRef = useRef<HTMLDivElement>(null);
  const { data: categories = [] } = useSalesCategoryList();
  const createSale = useCreateSale();
  const {
    control,
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<SalesEntryFormValues>({
    mode: 'onChange',
    defaultValues: {
      date: new Date(),
      amounts: categories.map(() => ({ value: '' })),
    },
  });
  const toAmounts = (amounts: SalesEntryFormValues['amounts']) =>
    categories.map((_, index) =>
      Number(normalizeAmount(amounts[index]?.value)),
    );
  const parsedAmounts = toAmounts(useWatch({ control, name: 'amounts' }));
  const isTotalAvailable = parsedAmounts.every(Number.isFinite);
  const total = parsedAmounts.reduce((sum, amount) => sum + amount, 0);

  const handleSave = ({ date, amounts }: SalesEntryFormValues) => {
    const values = toAmounts(amounts);
    createSale.mutate(
      {
        date: formatCalendarDate(date),
        sales: categories.map(({ id }, index) => ({
          categoryId: id,
          amount: values[index],
        })),
        totalAmount: values.reduce((sum, amount) => sum + amount, 0),
      },
      {
        onSuccess: () => {
          toast.success('매출 내역을 저장했어요.', { id: 'sales-saved' });
          close();
        },
      },
    );
  };

  return (
    <Modal
      open={isOpen}
      stackIndex={stackIndex}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      onOpenChangeComplete={(open) => {
        if (!open) unmount();
      }}
    >
      <Modal.Panel
        ref={panelRef}
        initialFocus={panelRef}
        finalFocus={() => returnFocus}
        placement="sheetOnMobile"
        className="w-[710px] max-w-[calc(100vw-48px)] gap-3.5 rounded-[16px]! border border-slate-200 px-[19px] py-5 max-desktop:w-[505px] max-tablet:w-full max-tablet:max-w-none max-tablet:gap-2.5 max-tablet:rounded-t-[32px]! max-tablet:rounded-b-none! max-tablet:border-0 max-tablet:p-6"
      >
        <Modal.Header>
          <Modal.Title
            className={cn(
              typographyVariants({ role: 'sectionTitle' }),
              'text-slate-950',
            )}
          >
            하루 매출 입력
          </Modal.Title>
          <Modal.CloseButton className="sr-only focus:not-sr-only" />
        </Modal.Header>
        <form className="contents" onSubmit={handleSubmit(handleSave)}>
          <Modal.Body className="flex-initial space-y-3.5 max-tablet:space-y-2.5">
            <div className="w-[328px] max-w-full space-y-2">
              <span
                id="sales-entry-date-label"
                className={cn(
                  typographyVariants({ role: 'label' }),
                  'text-slate-950',
                )}
              >
                날짜
              </span>
              <div
                role="group"
                aria-labelledby="sales-entry-date-label"
                className="relative"
              >
                <Controller
                  control={control}
                  name="date"
                  rules={{
                    validate: (date) =>
                      formatCalendarDate(date) <=
                        formatCalendarDate(new Date()) ||
                      '미래 날짜는 선택할 수 없습니다.',
                  }}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      className={cn(
                        typographyVariants({ role: 'body' }),
                        'h-11 rounded-md border-slate-200 px-3 pr-10',
                      )}
                    />
                  )}
                />
                <CalendarDaysIcon
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-slate-400"
                />
              </div>
              {errors.date && <p role="alert">{errors.date.message}</p>}
            </div>
            <div className="space-y-3.5 border-b border-slate-300 py-5">
              {categories.map((category, index) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between gap-3"
                >
                  <label
                    htmlFor={`sales-entry-amount-${index}`}
                    className={cn(
                      typographyVariants({ role: 'label' }),
                      'shrink-0 wrap-anywhere text-slate-950 max-tablet:w-[93px]',
                    )}
                  >
                    {category.name}
                  </label>
                  <div className="w-[222px] min-w-0 max-tablet:flex-1">
                    <Input
                      {...register(`amounts.${index}.value`, {
                        validate: (value) => {
                          const normalizedValue = normalizeAmount(value);

                          return (
                            normalizedValue === '' ||
                            (/^\d+$/.test(normalizedValue) &&
                              Number.isFinite(Number(normalizedValue))) ||
                            '0 이상의 정수로 입력해 주세요.'
                          );
                        },
                      })}
                      onInput={(event) => {
                        event.currentTarget.value =
                          event.currentTarget.value.replace(/\D/g, '');
                      }}
                      id={`sales-entry-amount-${index}`}
                      aria-invalid={Boolean(errors.amounts?.[index]?.value)}
                      size="small"
                      inputMode="numeric"
                      placeholder="0"
                      rightSlot={
                        <span
                          className={cn(
                            typographyVariants({ role: 'supporting' }),
                            'text-slate-400',
                          )}
                        >
                          원
                        </span>
                      }
                      className={cn(
                        typographyVariants({ role: 'data' }),
                        'h-[42px] w-full min-w-0 rounded-md border-slate-200 py-2 [&_input]:text-right',
                      )}
                    />
                    {errors.amounts?.[index]?.value && (
                      <p role="alert">{errors.amounts[index].value.message}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div
              className={cn(
                typographyVariants({ role: 'subtitle' }),
                'flex items-center justify-between py-2 text-slate-950',
              )}
            >
              <span>합계</span>
              <output aria-live="polite">
                {isTotalAvailable
                  ? `${NUMBER_FORMAT.format(total)} 원`
                  : '금액을 확인해 주세요'}
              </output>
            </div>
            <div
              className={cn(
                typographyVariants({ role: 'supporting' }),
                'flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-[15px] py-3.5 text-slate-400',
              )}
            >
              <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              <p>이미 매출이 있는 날짜는 기존 내역에서 수정해 주세요.</p>
            </div>
            {createSale.isError && (
              <p
                role="alert"
                className={cn(
                  typographyVariants({ role: 'supporting' }),
                  'text-warning-500',
                )}
              >
                {formatSalesError(createSale.error)}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer className="justify-end [&>*]:flex-none">
            <Button
              type="button"
              hierarchy="tertiary"
              size="small"
              className="h-10 w-auto"
              onClick={() => reset()}
            >
              초기화
            </Button>
            <Button
              type="submit"
              size="small"
              disabled={createSale.isPending || categories.length === 0}
              className="h-10 w-auto"
            >
              저장
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Panel>
    </Modal>
  );
}

export { SalesEntryModal };
