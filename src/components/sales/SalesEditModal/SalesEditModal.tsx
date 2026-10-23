'use client';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { Modal } from '@components/_common/Modal/Modal';

import type { Sale } from '@lib/api/entities/sales/toSale';
import type { SalesCategory } from '@lib/api/entities/sales-category/toSalesCategory';
import { cn } from '@lib/utilities/cn';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';
import { typographyVariants } from '@lib/utilities/typography';

interface SalesEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  date: string;
  categories: SalesCategory[];
  draftSales: Sale['sales'];
  hasAmountError: boolean;
  mutationError: unknown;
  isPending: boolean;
  onAmountChange: (categoryId: number, amount: number) => void;
  onSave: () => void;
}

function SalesEditModal({
  open,
  onOpenChange,
  date,
  categories,
  draftSales,
  hasAmountError,
  mutationError,
  isPending,
  onAmountChange,
  onSave,
}: SalesEditModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <Modal.Panel
        placement="sheetOnMobile"
        className="w-full max-w-none gap-2.5 rounded-t-[32px]! rounded-b-none! border-0 p-6"
      >
        <Modal.Header>
          <Modal.Title
            className={cn(
              typographyVariants({ role: 'sectionTitle' }),
              'text-balance text-slate-950',
            )}
          >
            매출 내역 수정
          </Modal.Title>
          <Modal.CloseButton className="sr-only focus:not-sr-only" />
        </Modal.Header>
        <form
          className="contents"
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <Modal.Body className="flex-initial space-y-2.5">
            <div className="space-y-2">
              <label
                htmlFor="sales-edit-date"
                className={cn(
                  typographyVariants({ role: 'label' }),
                  'text-slate-950',
                )}
              >
                날짜
              </label>
              <Input
                id="sales-edit-date"
                readOnly
                size="small"
                value={date}
                className={cn(
                  typographyVariants({ role: 'body' }),
                  'h-11 rounded-md border-slate-200 py-2',
                )}
              />
            </div>
            <div className="space-y-3.5 border-b border-slate-300 py-5">
              {categories.map((category) => {
                const amount =
                  draftSales.find((item) => item.categoryId === category.id)
                    ?.amount ?? 0;
                return (
                  <div
                    key={category.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <label
                      htmlFor={`sales-edit-amount-${category.id}`}
                      className={cn(
                        typographyVariants({ role: 'label' }),
                        'w-[93px] shrink-0 wrap-anywhere text-slate-950',
                      )}
                    >
                      {category.name}
                    </label>
                    <Input
                      id={`sales-edit-amount-${category.id}`}
                      type="number"
                      min={0}
                      step={1}
                      size="small"
                      disabled={isPending}
                      aria-invalid={
                        hasAmountError &&
                        (!Number.isInteger(amount) || amount < 0)
                      }
                      value={amount}
                      onChange={(event) =>
                        onAmountChange(category.id, Number(event.target.value))
                      }
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
                        'h-[42px] w-full min-w-0 flex-1 rounded-md border-slate-200 py-2 [&_input]:text-right',
                      )}
                    />
                  </div>
                );
              })}
            </div>
            {hasAmountError && (
              <p
                role="alert"
                className={cn(
                  typographyVariants({ role: 'supporting' }),
                  'text-warning-700',
                )}
              >
                0 이상의 정수로 입력해 주세요.
              </p>
            )}
            {mutationError !== null && (
              <p
                role="alert"
                className={cn(
                  typographyVariants({ role: 'supporting' }),
                  'text-warning-700',
                )}
              >
                {formatSalesError(mutationError)}
              </p>
            )}
          </Modal.Body>
          <Modal.Footer className="justify-end [&>*]:flex-none max-tablet:[&>*]:flex-1">
            <Button
              type="button"
              hierarchy="tertiary"
              size="small"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
              className={cn(
                typographyVariants({ role: 'label' }),
                'h-10 w-auto',
              )}
            >
              취소
            </Button>
            <Button
              type="submit"
              size="small"
              disabled={isPending}
              className={cn(
                typographyVariants({ role: 'label' }),
                'h-10 w-auto',
              )}
            >
              저장
            </Button>
          </Modal.Footer>
        </form>
      </Modal.Panel>
    </Modal>
  );
}

export { SalesEditModal };
