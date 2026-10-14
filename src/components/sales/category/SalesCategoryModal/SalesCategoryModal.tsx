'use client';

import { PlusIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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

import type { SalesCategory } from '@lib/api/entities/sales-category/toSalesCategory';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

const MAX_CATEGORY_COUNT = 10;
const MAX_CATEGORY_NAME_LENGTH = 10;
const DUPLICATED_NAME_MESSAGE = '중복된 이름입니다.';

const EMPTY_CATEGORIES: SalesCategory[] = [];

interface SalesCategoryFormValues {
  categories: { categoryId: number; name: string; color: string }[];
}

const toFormValues = (
  categories: SalesCategory[],
  editedNames = new Map<number, string>(),
): SalesCategoryFormValues => ({
  categories: categories.map(({ id, name, color }) => ({
    categoryId: id,
    name: editedNames.get(id) ?? name,
    color,
  })),
});

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
  const listRef = useRef<HTMLDivElement>(null);
  const addedCategoryIdRef = useRef<number | null>(null);
  const { data: categories = EMPTY_CATEGORIES } = useSalesCategoryList();
  const createCategory = useCreateSalesCategory();
  const deleteCategory = useDeleteSalesCategory();
  const updateCategories = useUpdateSalesCategories();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [mutationError, setMutationError] = useState<unknown>(null);
  // NOTE: 알림은 다음 입력·요청까지만 유효하다. 남겨두면 가상 커서로 지난 결과를 다시 만나고, 같은 문구는 다시 읽히지 않는다
  const [statusMessage, setStatusMessage] = useState('');
  const isPending =
    createCategory.isPending ||
    deleteCategory.isPending ||
    updateCategories.isPending;
  const { control, register, reset, handleSubmit, getValues } =
    useForm<SalesCategoryFormValues>({
      defaultValues: toFormValues(categories),
    });

  // NOTE: 추가·삭제로 목록이 바뀌어도 저장하지 않은 이름 변경은 categoryId 기준으로 유지한다. index 기준이면 앞 행 삭제 시 다른 카테고리에 붙는다 (docs/feature/sales/README.md "카테고리 관리")
  useEffect(() => {
    const editedNames = new Map(
      getValues('categories').map(({ categoryId, name }) => [categoryId, name]),
    );
    reset(toFormValues(categories, editedNames));
  }, [categories, getValues, reset]);
  const { fields } = useFieldArray({ control, name: 'categories' });

  // NOTE: 새 행은 서버가 목록 맨 뒤에 붙인다. 연속 추가(초기 세팅)를 위해 포커스는 추가 입력칸에 두고 스크롤만 한다
  useEffect(() => {
    const addedId = addedCategoryIdRef.current;
    if (addedId === null) return;
    const row = listRef.current?.querySelector(
      `[data-category-id="${addedId}"]`,
    );
    if (!row) return;
    row.scrollIntoView({ block: 'nearest' });
    addedCategoryIdRef.current = null;
  }, [fields]);
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
    setStatusMessage('');
    createCategory.mutate(trimmedNewName, {
      onSuccess: ({ id, name }) => {
        addedCategoryIdRef.current = id;
        setStatusMessage(`${name} 카테고리를 추가했습니다.`);
        setNewCategoryName('');
      },
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
      setStatusMessage('');
      deleteCategory.mutate(categoryId, { onError: setMutationError });
    }
  };

  const handleSave = handleSubmit((values) => {
    setMutationError(null);
    setStatusMessage('');
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
        <Modal.Body
          onInput={() => setStatusMessage('')}
          className="flex flex-initial flex-col gap-5 overflow-hidden border-b border-slate-300 py-5"
        >
          <section aria-labelledby="new-category-heading" className="space-y-2">
            <h3
              id="new-category-heading"
              className="text-sm font-semibold text-slate-600"
            >
              새 카테고리
            </h3>
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
          </section>
          <section
            aria-labelledby="edit-category-heading"
            className="flex min-h-0 flex-col gap-3.5 border-t border-slate-200 pt-5"
          >
            <h3
              id="edit-category-heading"
              className="text-sm font-semibold text-slate-600"
            >
              이름 수정
            </h3>
            <div
              ref={listRef}
              className="min-h-0 flex-1 space-y-3.5 overflow-y-auto"
            >
              {fields.map(({ id, categoryId, color }, index) => {
                const name =
                  categories.find((category) => category.id === categoryId)
                    ?.name ?? '';
                return (
                  <div
                    key={id}
                    data-category-id={categoryId}
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
                );
              })}
            </div>
          </section>
          <p role="status" className="sr-only">
            {statusMessage}
          </p>
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
            onClick={() => reset(toFormValues(categories))}
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
