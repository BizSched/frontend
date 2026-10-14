'use client';

import { PlusIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';

import { Button } from '@components/_common/Button/Button';
import { Input } from '@components/_common/Input/Input';
import { Modal } from '@components/_common/Modal/Modal';
import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { TextButton } from '@components/_common/TextButton/TextButton';

import { useCreateSalesCategory } from '@hooks/api/sales-category/useCreateSalesCategory';
import { useDeleteSalesCategory } from '@hooks/api/sales-category/useDeleteSalesCategory';
import { useSalesCategoryList } from '@hooks/api/sales-category/useSalesCategoryList';
import { useUpdateSalesCategories } from '@hooks/api/sales-category/useUpdateSalesCategories';
import { useOverlayStackIndex } from '@hooks/overlay/useOverlayStackIndex';

import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

const MAX_CATEGORY_COUNT = 10;
const MAX_CATEGORY_NAME_LENGTH = 10;
const DUPLICATED_NAME_MESSAGE = '중복된 이름입니다.';

interface SalesCategoryFormValues {
  categories: { categoryId: number; name: string; color: string }[];
}

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
  const { data: categories = [] } = useSalesCategoryList();
  const createCategory = useCreateSalesCategory();
  const deleteCategory = useDeleteSalesCategory();
  const updateCategories = useUpdateSalesCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [mutationError, setMutationError] = useState<unknown>(null);
  const isPending =
    createCategory.isPending ||
    deleteCategory.isPending ||
    updateCategories.isPending;

  // NOTE: 추가·삭제 후 다시 조회되면 values가 바뀌어 폼을 서버 값으로 다시 채운다. 저장하지 않은 이름 변경은 버린다 (docs/feature/sales/README.md "카테고리 관리")
  const { control, register, reset, handleSubmit } =
    useForm<SalesCategoryFormValues>({
      values: {
        categories: categories.map(({ id, name, color }) => ({
          categoryId: id,
          name,
          color,
        })),
      },
    });
  const { fields } = useFieldArray({ control, name: 'categories' });
  const names = (useWatch({ control, name: 'categories' }) ?? []).map(
    ({ name }) => name.trim(),
  );
  const isNameDuplicated = (index: number) =>
    names.some((name, i) => i !== index && name === names[index]);
  const canSave = names.every(
    (name, index) => name !== '' && !isNameDuplicated(index),
  );

  const trimmedNewName = newCategoryName.trim();
  const isNewNameDuplicated = categories.some(
    ({ name }) => name.trim() === trimmedNewName,
  );
  const canAdd =
    trimmedNewName !== '' &&
    !isNewNameDuplicated &&
    categories.length < MAX_CATEGORY_COUNT;

  const handleCategoryAdd = () => {
    setMutationError(null);
    createCategory.mutate(trimmedNewName, {
      onSuccess: () => setNewCategoryName(''),
      onError: setMutationError,
    });
  };

  const handleCategoryDelete = async (categoryId: number) => {
    const isConfirmed = await openConfirmModal({
      title: '정말 삭제하시겠어요?',
      description: '삭제된 카테고리는 복구할 수 없습니다.',
      confirmText: '삭제',
    });

    if (isConfirmed) {
      setMutationError(null);
      deleteCategory.mutate(categoryId, { onError: setMutationError });
    }
  };

  const handleSave = handleSubmit((values) => {
    setMutationError(null);
    updateCategories.mutate(
      values.categories.map(({ categoryId, name }, order) => ({
        id: categoryId,
        name: name.trim(),
        order,
      })),
      { onSuccess: close, onError: setMutationError },
    );
  });

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
          {fields.map(({ id, categoryId, name, color }, index) => (
            <div
              key={id}
              className="flex items-center justify-between border-b border-slate-200 pb-3 max-tablet:pb-2"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: color }}
                  className="size-3 shrink-0 rounded-[2px] max-tablet:size-2"
                />
                <div className="min-w-0 flex-1">
                  <Input
                    size="small"
                    aria-label={`${name} 카테고리 이름`}
                    aria-invalid={isNameDuplicated(index)}
                    maxLength={MAX_CATEGORY_NAME_LENGTH}
                    {...register(`categories.${index}.name`)}
                    className="max-w-[327px] border-[#ccc] font-medium text-slate-800 max-tablet:h-7 max-tablet:px-2 max-tablet:py-1"
                  />
                  {isNameDuplicated(index) && (
                    <p className="mt-1 text-xs text-warning-500">
                      {DUPLICATED_NAME_MESSAGE}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex w-[208.5px] shrink-0 justify-end">
                <TextButton
                  type="button"
                  aria-label={`${name} 카테고리 삭제`}
                  disabled={isPending}
                  onClick={() => void handleCategoryDelete(categoryId)}
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
              <div className="min-w-0 flex-1">
                <Input
                  size="small"
                  aria-label="새 카테고리 이름"
                  placeholder="새 카테고리 이름"
                  aria-invalid={trimmedNewName !== '' && isNewNameDuplicated}
                  maxLength={MAX_CATEGORY_NAME_LENGTH}
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className="max-w-[327px] border-[#ccc] font-medium max-tablet:h-6 max-tablet:px-2 max-tablet:py-1 max-tablet:text-xs"
                />
                {trimmedNewName !== '' && isNewNameDuplicated && (
                  <p className="mt-1 text-xs text-warning-500">
                    {DUPLICATED_NAME_MESSAGE}
                  </p>
                )}
              </div>
            </div>
            <Button
              type="button"
              size="small"
              disabled={!canAdd || isPending}
              onClick={handleCategoryAdd}
              icon={
                <PlusIcon aria-hidden="true" className="max-tablet:hidden" />
              }
              className="w-auto max-tablet:h-9 max-tablet:text-xs"
            >
              추가
            </Button>
          </div>
          {mutationError !== null && (
            <p role="alert" className="text-sm text-warning-500">
              {formatSalesError(mutationError)}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="justify-end [&>*]:flex-none">
          <Button
            type="button"
            hierarchy="tertiary"
            disabled={isPending}
            onClick={() => reset()}
            size="small"
            className="h-10 w-auto"
          >
            되돌리기
          </Button>
          <Button
            type="button"
            size="small"
            disabled={!canSave || isPending}
            onClick={() => void handleSave()}
            className="h-10 w-auto"
          >
            저장
          </Button>
        </Modal.Footer>
      </Modal.Panel>
    </Modal>
  );
}

export { SalesCategoryModal };
