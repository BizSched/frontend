'use client';

import { PlusIcon } from 'lucide-react';
import { useRef } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { Modal } from '@components/_common/Modal/Modal';
import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { TextButton } from '@components/_common/TextButton/TextButton';

import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

import { cn } from '@lib/utilities/cn';

const MOCK_CATEGORIES = [
  { name: '상품 판매', color: 'bg-primary-700' },
  { name: '서비스', color: 'bg-secondary-500' },
  { name: '배달·온라인', color: 'bg-primary-500' },
  { name: '기타', color: 'bg-primary-400' },
];

interface SalesCategoryModalProps {
  overlayId: string;
  isOpen: boolean;
  close: () => void;
  unmount: () => void;
  returnFocus: HTMLElement;
}

function SalesCategoryModal({
  overlayId,
  isOpen,
  close,
  unmount,
  returnFocus,
}: SalesCategoryModalProps) {
  const stackIndex = useOverlayStackIndex(overlayId);
  const panelRef = useRef<HTMLDivElement>(null);
  const { control, register, reset } = useForm({
    defaultValues: { categories: MOCK_CATEGORIES, newCategoryName: '' },
  });
  const { fields, remove } = useFieldArray({ control, name: 'categories' });

  const handleCategoryDelete = async (index: number) => {
    const isConfirmed = await openConfirmModal({
      title: '정말 삭제하시겠어요?',
      description: '삭제된 카테고리는 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소',
    });

    if (isConfirmed) {
      remove(index);
    }
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
        placement="sheetOnMobile"
        ref={panelRef}
        initialFocus={panelRef}
        finalFocus={() => returnFocus}
        className="min-h-[582px] w-[710px] max-w-[calc(100vw-48px)] gap-3.5 rounded-[16px]! border border-slate-200 px-[19px] py-5 max-desktop:w-[550px] max-tablet:min-h-0 max-tablet:w-full max-tablet:max-w-none max-tablet:gap-2.5 max-tablet:rounded-t-[32px]! max-tablet:rounded-b-none! max-tablet:border-0 max-tablet:p-6"
      >
        <Modal.Header>
          <Modal.Title className="text-xl leading-[30px] font-bold tracking-normal text-slate-950">
            카테고리 관리
          </Modal.Title>
          <Modal.CloseButton className="sr-only focus:not-sr-only" />
        </Modal.Header>
        <Modal.Body className="flex-initial space-y-3.5 border-b border-slate-300 py-5">
          {fields.map(({ id, name, color }, index) => (
            <div
              key={id}
              className="flex items-center justify-between border-b border-slate-200 pb-3 max-tablet:pb-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-3 shrink-0 rounded-[2px] max-tablet:size-2',
                    color,
                  )}
                />
                <Input
                  size="small"
                  aria-label={`${name} 카테고리 이름`}
                  {...register(`categories.${index}.name`)}
                  className="max-w-[327px] border-[#ccc] font-medium text-slate-800 max-tablet:h-7 max-tablet:px-2 max-tablet:py-1"
                />
              </div>
              <div className="flex w-[208.5px] shrink-0 justify-end">
                <TextButton
                  type="button"
                  aria-label={`${name} 카테고리 삭제`}
                  onClick={() => void handleCategoryDelete(index)}
                  className="max-tablet:text-xs max-tablet:leading-4"
                >
                  삭제
                </TextButton>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="size-3 shrink-0 rounded-[2px] bg-primary-700 max-tablet:size-2"
              />
              <Input
                size="small"
                aria-label="새 카테고리 이름"
                placeholder="새 카테고리 이름"
                {...register('newCategoryName')}
                className="max-w-[327px] border-[#ccc] font-medium max-tablet:h-6 max-tablet:px-2 max-tablet:py-1 max-tablet:text-xs"
              />
            </div>
            <Button
              type="button"
              size="small"
              disabled
              icon={
                <PlusIcon aria-hidden="true" className="max-tablet:hidden" />
              }
              className="w-auto max-tablet:h-9 max-tablet:text-xs"
            >
              추가
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer className="justify-end [&>*]:flex-none">
          <Button
            type="button"
            hierarchy="tertiary"
            onClick={() => reset()}
            size="small"
            className="h-10 w-auto"
          >
            되돌리기
          </Button>
          <Button type="button" size="small" className="h-10 w-auto">
            저장
          </Button>
        </Modal.Footer>
      </Modal.Panel>
    </Modal>
  );
}

export { SalesCategoryModal };
