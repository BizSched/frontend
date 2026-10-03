'use client';

import { CalendarDaysIcon, InfoIcon } from 'lucide-react';
import { useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { DatePicker } from '@components/_common/DatePicker/DatePicker';
import { Input } from '@components/_common/Input/Input';
import { Modal } from '@components/_common/Modal/Modal';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

const MOCK_CATEGORIES = ['상품 판매', '서비스', '배달·온라인', '기타'];
const NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');

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
  const { control, register, reset } = useForm({
    defaultValues: {
      date: new Date(),
      amounts: MOCK_CATEGORIES.map(() => ({ value: '' })),
    },
  });
  const amounts = useWatch({ control, name: 'amounts' });
  const parsedAmounts = amounts.map(({ value }) =>
    Number(value.replaceAll(',', '').trim()),
  );
  const isTotalAvailable = parsedAmounts.every(Number.isFinite);
  const total = parsedAmounts.reduce((sum, amount) => sum + amount, 0);

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
          <Modal.Title className="text-xl leading-[30px] font-bold tracking-normal text-slate-950">
            하루 매출 입력
          </Modal.Title>
          <Modal.CloseButton className="sr-only focus:not-sr-only" />
        </Modal.Header>
        <Modal.Body className="flex-initial space-y-3.5 max-tablet:space-y-2.5">
          <div className="w-[328px] max-w-full space-y-2">
            <span
              id="sales-entry-date-label"
              className="text-base leading-5 font-semibold text-slate-950"
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
                render={({ field }) => (
                  <DatePicker
                    value={field.value}
                    onChange={field.onChange}
                    className="h-11 rounded-md border-slate-200 px-3 pr-10 text-sm"
                  />
                )}
              />
              <CalendarDaysIcon
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <div className="space-y-3.5 border-b border-slate-300 py-5">
            {MOCK_CATEGORIES.map((category, index) => (
              <div
                key={category}
                className="flex items-center justify-between gap-3"
              >
                <label
                  htmlFor={`sales-entry-amount-${index}`}
                  className="shrink-0 text-base font-medium text-slate-950 max-tablet:w-[93px]"
                >
                  {category}
                </label>
                <Input
                  {...register(`amounts.${index}.value`)}
                  id={`sales-entry-amount-${index}`}
                  size="small"
                  inputMode="decimal"
                  placeholder="0"
                  rightSlot={<span className="text-sm text-slate-300">원</span>}
                  className="h-[42px] w-[222px] min-w-0 rounded-md border-slate-200 text-sm font-medium max-tablet:flex-1 [&_input]:text-right"
                />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between py-2 text-base leading-5 font-semibold text-slate-950">
            <span>합계</span>
            <output aria-live="polite">
              {isTotalAvailable
                ? `${NUMBER_FORMAT.format(total)} 원`
                : '금액을 확인해 주세요'}
            </output>
          </div>
          <div className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 px-[15px] py-3.5 text-sm leading-5 text-slate-400">
            <InfoIcon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <p>이미 매출이 있는 날짜는 기존 내역에서 수정해 주세요.</p>
          </div>
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
          <Button type="button" size="small" className="h-10 w-auto">
            저장
          </Button>
        </Modal.Footer>
      </Modal.Panel>
    </Modal>
  );
}

export { SalesEntryModal };
