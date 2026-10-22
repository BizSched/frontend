'use client';

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  Trash2Icon,
} from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';

import { Card } from '@components/_common/Card/Card';
import { Input } from '@components/_common/Input/Input';
import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { MonthSelectDropdown } from '@components/_common/MonthSelectDropdown/MonthSelectDropdown';
import { PaginationButton } from '@components/_common/Pagination/PaginationButton';
import { PaginationContent } from '@components/_common/Pagination/PaginationContent';
import { PaginationItem } from '@components/_common/Pagination/PaginationItem';
import { PaginationRoot } from '@components/_common/Pagination/PaginationRoot';
import { Table } from '@components/_common/Table/Table';
import { toast } from '@components/_common/Toast/Toaster';
import { SalesEditModal } from '@components/sales/SalesEditModal/SalesEditModal';

import { useDeleteSale } from '@hooks/api/sales/useDeleteSale';
import { useSalesList } from '@hooks/api/sales/useSalesList';
import { useSalesMonthTotal } from '@hooks/api/sales/useSalesMonthTotal';
import { useUpdateSale } from '@hooks/api/sales/useUpdateSale';
import { useSalesCategoryList } from '@hooks/api/sales-category/useSalesCategoryList';
import { useDatePickerLayout } from '@hooks/datePicker/useDatePickerLayout';
import { usePageSearchParam } from '@hooks/pagination/usePageSearchParam';

import type { Sale } from '@lib/api/entities/sales/toSale';
import { cn } from '@lib/utilities/cn';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';
import { isSalesMonth } from '@lib/utilities/sales/salesMonth';
import { typographyVariants } from '@lib/utilities/typography';

const NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');
const PAGE_SIZE = 10;

const createUrl = (pathname: string, searchParams: URLSearchParams) => {
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
};

interface SalesDetailsSectionProps {
  initialMonth: string;
}

function SalesDetailsSection({ initialMonth }: SalesDetailsSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentPage: page, setCurrentPage } = usePageSearchParam();
  const updateSale = useUpdateSale();
  const deleteSale = useDeleteSale();
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [draftSales, setDraftSales] = useState<Sale['sales']>([]);
  const [hasAmountError, setHasAmountError] = useState(false);
  const [mutationError, setMutationError] = useState<unknown>(null);
  const isPending = updateSale.isPending || deleteSale.isPending;
  // NOTE: 시트 전환 기준(max-tablet)이 날짜 선택 시트와 같아 레이아웃 훅을 재사용한다
  const isSheet = useDatePickerLayout() === 'sheet';
  const monthParam = searchParams.get('month');
  const month = isSalesMonth(monthParam) ? monthParam : initialMonth;

  const {
    data: salesList,
    isLoading: isSalesLoading,
    isError: isSalesError,
    error: salesError,
    refetch: refetchSales,
  } = useSalesList({ month, page, size: PAGE_SIZE });
  const {
    data: monthTotal,
    isLoading: isMonthTotalLoading,
    isError: isMonthTotalError,
    error: monthTotalError,
    refetch: refetchMonthTotal,
  } = useSalesMonthTotal({ month });
  const {
    error: categoriesError,
    data: categories,
    isLoading: isCategoriesLoading,
    isError: isCategoriesError,
    refetch: refetchCategories,
  } = useSalesCategoryList();
  const isLoading =
    isCategoriesLoading || isSalesLoading || isMonthTotalLoading;
  const isError = isSalesError || isMonthTotalError || isCategoriesError;
  const error = salesError || monthTotalError || categoriesError;
  const totalPages = Math.max(salesList?.totalPage ?? 1, 1);
  const editingSale = salesList?.items.find((sale) => sale.id === editingDay);
  const isSheetOpen = isSheet && editingSale !== undefined;

  const scope = month + ':' + page;
  const [editingScope, setEditingScope] = useState(scope);
  if (editingScope !== scope) {
    setEditingScope(scope);
    setEditingDay(null);
    setMutationError(null);
    setHasAmountError(false);
  }

  const handleEdit = (sale: Sale) => {
    setEditingDay(sale.id);
    setDraftSales([
      ...sale.sales,
      ...(categories ?? [])
        .filter(
          (category) =>
            !sale.sales.some((item) => item.categoryId === category.id),
        )
        .map((category) => ({
          categoryId: category.id,
          name: category.name,
          amount: 0,
        })),
    ]);
    setHasAmountError(false);
    setMutationError(null);
  };

  const handleEditCancel = () => {
    setEditingDay(null);
    setMutationError(null);
  };

  const handleAmountChange = (categoryId: number, amount: number) =>
    setDraftSales((currentSales) =>
      currentSales.map((item) =>
        item.categoryId === categoryId ? { ...item, amount } : item,
      ),
    );

  const handleEditSave = () => {
    if (editingDay === null || isPending) return;
    if (
      draftSales.some(({ amount }) => !Number.isInteger(amount) || amount < 0)
    ) {
      setHasAmountError(true);
      return;
    }
    setMutationError(null);
    updateSale.mutate(
      {
        salesId: editingDay,
        body: {
          sales: draftSales.map(({ categoryId, amount }) => ({
            categoryId,
            amount,
          })),
          totalAmount: draftSales.reduce((sum, { amount }) => sum + amount, 0),
        },
      },
      {
        onSuccess: () => {
          setEditingDay(null);
          toast.success('매출 내역을 수정했어요.', { id: 'sales-updated' });
        },
        onError: setMutationError,
      },
    );
  };

  const handleDelete = async (salesId: number) => {
    if (isPending) return;
    const isConfirmed = await openConfirmModal({
      title: '해당 날짜의 매출 전체를 삭제할까요?',
      description: '삭제한 내역은 복구할 수 없습니다.',
      confirmText: '삭제',
    });
    if (isConfirmed) {
      setMutationError(null);
      deleteSale.mutate(salesId, {
        onSuccess: () =>
          toast.success('매출 내역을 삭제했어요.', { id: 'sales-deleted' }),
        onError: setMutationError,
      });
    }
  };

  useEffect(() => {
    if (salesList && page > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [page, salesList, setCurrentPage, totalPages]);

  const handleMonthChange = (selectedMonth: number) => {
    const nextMonth = `${month.slice(0, 4)}-${String(selectedMonth).padStart(2, '0')}`;

    if (nextMonth === month) return;

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('month', nextMonth);
    nextSearchParams.delete('page');
    router.push(createUrl(pathname, nextSearchParams));
  };

  return (
    <Card
      radius="2xl"
      padding="lg"
      className="gap-5 shadow-[0_0_30px_rgba(0,0,0,0.05)]"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonthSelectDropdown
              value={Number(month.slice(5, 7))}
              onChange={handleMonthChange}
              size="small"
              className={cn(
                typographyVariants({ role: 'label' }),
                'border-slate-100 px-3 py-1 text-slate-800',
              )}
            />
            <h2
              id="sales-month-title"
              className={cn(
                typographyVariants({ role: 'sectionTitle' }),
                'text-slate-950',
              )}
            >
              매출
            </h2>
          </div>
          <span
            className={cn(
              typographyVariants({ role: 'supporting' }),
              'text-slate-500',
            )}
          >
            월 전체 합계
          </span>
        </div>
        <p
          className={cn(
            typographyVariants({ role: 'metric' }),
            'text-right text-slate-800',
          )}
        >
          합계{' '}
          {monthTotal === undefined
            ? '-'
            : `${NUMBER_FORMAT.format(monthTotal)} 원`}
        </p>
      </div>

      <div className="border-b border-slate-500 pb-2">
        {isError ? (
          <div
            className={cn(
              typographyVariants({ role: 'supporting' }),
              'py-8 text-center text-slate-500',
            )}
          >
            <p>{formatSalesError(error)}</p>
            <button
              type="button"
              onClick={() => {
                void refetchSales();
                void refetchMonthTotal();
                void refetchCategories();
              }}
              className="mt-2 cursor-pointer font-semibold text-slate-700 underline"
            >
              다시 시도
            </button>
          </div>
        ) : isLoading ? (
          <p
            className={cn(
              typographyVariants({ role: 'supporting' }),
              'py-8 text-center text-slate-500',
            )}
          >
            매출 내역을 불러오는 중입니다.
          </p>
        ) : salesList && salesList.items.length === 0 ? (
          <p
            className={cn(
              typographyVariants({ role: 'supporting' }),
              'py-8 text-center text-slate-500',
            )}
          >
            등록된 매출 내역이 없습니다.
          </p>
        ) : (
          <Table
            aria-label="날짜별 매출 내역"
            className={cn(typographyVariants({ role: 'body' }), 'table-fixed')}
          >
            <Table.Header>
              <Table.Row className="border-slate-200 hover:bg-transparent">
                <Table.Head
                  scope="col"
                  className={cn(
                    typographyVariants({ role: 'label' }),
                    'h-auto w-[118px] px-0 pb-1 text-center text-slate-500 max-desktop:w-[100px]',
                  )}
                >
                  날짜
                </Table.Head>
                {categories?.map((category) => (
                  <Table.Head
                    key={category.id}
                    scope="col"
                    className={cn(
                      typographyVariants({ role: 'label' }),
                      'h-auto px-1 pb-1 text-center wrap-anywhere whitespace-normal text-slate-500 max-tablet:hidden',
                    )}
                  >
                    {category.name}
                  </Table.Head>
                ))}
                <Table.Head
                  scope="col"
                  className={cn(
                    typographyVariants({ role: 'label' }),
                    'h-auto w-[118px] px-0 pb-1 text-center text-slate-500 max-desktop:w-[100px] max-tablet:w-auto',
                  )}
                >
                  합계
                </Table.Head>
                <Table.Head
                  scope="col"
                  className="h-auto w-[104px] p-0 max-tablet:w-20"
                >
                  <span className="sr-only">내역 수정</span>
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {salesList?.items.map((sale) => {
                const saleDate = parseISO(sale.date);
                const dateLabel = format(saleDate, 'M월 d일', { locale: ko });
                const isEditing = editingDay === sale.id;
                return (
                  <Fragment key={sale.id}>
                    <Table.Row className="h-[59px] border-slate-50 hover:bg-transparent max-desktop:h-[55px]">
                      <Table.Head
                        scope="row"
                        className={cn(
                          typographyVariants({ role: 'subtitle' }),
                          'h-auto px-0 py-3.5 text-slate-950',
                        )}
                      >
                        <time dateTime={sale.date}>
                          {format(saleDate, 'M월 d일', { locale: ko })}
                        </time>
                        <span
                          className={cn(
                            typographyVariants({ role: 'caption' }),
                            'ml-2 text-slate-400 max-desktop:ml-1',
                          )}
                        >
                          {format(saleDate, 'EEEEE', { locale: ko })}
                        </span>
                      </Table.Head>
                      {categories?.map((category) => {
                        const amount =
                          sale.sales.find(
                            (item) => item.categoryId === category.id,
                          )?.amount ?? 0;
                        return (
                          <Table.Cell
                            key={category.id}
                            className={cn(
                              typographyVariants({ role: 'data' }),
                              'px-1 py-3.5 text-right text-slate-600 max-tablet:hidden',
                            )}
                          >
                            {NUMBER_FORMAT.format(amount)}
                          </Table.Cell>
                        );
                      })}
                      <Table.Cell
                        className={cn(
                          typographyVariants({ role: 'data' }),
                          'px-0 py-3.5 text-right font-semibold text-slate-950 max-tablet:pr-1',
                        )}
                      >
                        ₩{NUMBER_FORMAT.format(sale.totalAmount)}
                      </Table.Cell>
                      <Table.Cell className="px-0 py-2 text-right">
                        <div className="flex items-center justify-end gap-2 max-tablet:gap-1">
                          <button
                            type="button"
                            aria-label={`${dateLabel} 매출 수정`}
                            disabled={editingDay !== null || isPending}
                            onClick={() => handleEdit(sale)}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-slate-50 text-slate-800 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 max-tablet:size-9"
                          >
                            <PencilIcon
                              aria-hidden="true"
                              className="size-4.5"
                            />
                          </button>
                          <button
                            type="button"
                            aria-label={`${dateLabel} 매출 삭제`}
                            disabled={editingDay !== null || isPending}
                            onClick={() => void handleDelete(sale.id)}
                            className="flex size-10 cursor-pointer items-center justify-center rounded-xl bg-warning-50 text-warning-500 hover:bg-warning-100 focus-visible:ring-2 focus-visible:ring-warning-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 max-tablet:size-9"
                          >
                            <Trash2Icon
                              aria-hidden="true"
                              className="size-4.5"
                            />
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                    {isEditing && !isSheet && (
                      <Table.Row className="border-slate-50 bg-slate-100 hover:bg-slate-100">
                        <Table.Cell
                          colSpan={(categories?.length ?? 0) + 3}
                          className="px-4 py-4"
                        >
                          <div
                            role="group"
                            aria-label={`${dateLabel} 매출 수정`}
                            className="flex flex-wrap items-center gap-3"
                          >
                            <span
                              className={cn(
                                typographyVariants({ role: 'subtitle' }),
                                'text-slate-950',
                              )}
                            >
                              {dateLabel}
                            </span>
                            {categories?.map((category) => {
                              const amount =
                                draftSales.find(
                                  (item) => item.categoryId === category.id,
                                )?.amount ?? 0;
                              return (
                                <Input
                                  key={category.id}
                                  aria-label={
                                    category.name + ' ' + dateLabel + ' 매출'
                                  }
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
                                    handleAmountChange(
                                      category.id,
                                      Number(event.target.value),
                                    )
                                  }
                                  className={cn(
                                    typographyVariants({ role: 'data' }),
                                    'h-9 min-w-24 flex-1 border-slate-200 px-2 py-1 [&_input]:text-right',
                                  )}
                                />
                              );
                            })}
                            <span
                              className={cn(
                                typographyVariants({ role: 'data' }),
                                'ml-auto font-semibold text-slate-950',
                              )}
                            >
                              ₩
                              {NUMBER_FORMAT.format(
                                draftSales.reduce(
                                  (sum, { amount }) => sum + amount,
                                  0,
                                ),
                              )}
                            </span>
                          </div>
                          <div className="mt-3 flex justify-end gap-2">
                            <button
                              type="button"
                              aria-label={`${dateLabel} 편집 취소`}
                              onClick={handleEditCancel}
                              disabled={isPending}
                              className="cursor-pointer rounded px-3 py-1 text-base text-slate-500 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                            >
                              취소
                            </button>
                            <button
                              type="button"
                              aria-label={`${dateLabel} 편집 저장`}
                              onClick={handleEditSave}
                              disabled={isPending}
                              className="cursor-pointer rounded bg-primary-500 px-3 py-1 text-base text-white focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none"
                            >
                              저장
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    )}
                  </Fragment>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      {isSheetOpen && (
        <SalesEditModal
          open
          onOpenChange={(open) => {
            if (!open) handleEditCancel();
          }}
          date={editingSale.date}
          categories={categories ?? []}
          draftSales={draftSales}
          hasAmountError={hasAmountError}
          mutationError={mutationError}
          isPending={isPending}
          onAmountChange={handleAmountChange}
          onSave={handleEditSave}
        />
      )}
      {!isSheetOpen && editingDay !== null && hasAmountError && (
        <p
          role="alert"
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'mt-2 text-warning-700',
          )}
        >
          0 이상의 정수로 입력해 주세요.
        </p>
      )}
      {!isSheetOpen && mutationError !== null && (
        <p
          role="alert"
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'mt-2 text-warning-700',
          )}
        >
          {formatSalesError(mutationError)}
        </p>
      )}
      <PaginationRoot aria-label="매출 내역 페이지" className="pb-6">
        <PaginationContent className="gap-1">
          <PaginationItem className="mr-1.5">
            <PaginationButton
              aria-label="이전 페이지"
              disabled={page <= 1}
              onClick={() => setCurrentPage(page - 1)}
              className={cn(
                typographyVariants({ role: 'label' }),
                'max-desktop:size-8 max-desktop:rounded-md',
              )}
            >
              <ChevronLeftIcon aria-hidden="true" />
            </PaginationButton>
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (pageNumber) => (
              <PaginationItem key={pageNumber}>
                <PaginationButton
                  isActive={pageNumber === page}
                  aria-label={`${pageNumber}페이지`}
                  onClick={() => setCurrentPage(pageNumber)}
                  className={cn(
                    typographyVariants({ role: 'label' }),
                    'max-desktop:size-8 max-desktop:rounded-md',
                  )}
                >
                  {pageNumber}
                </PaginationButton>
              </PaginationItem>
            ),
          )}
          <PaginationItem className="ml-1.5">
            <PaginationButton
              aria-label="다음 페이지"
              disabled={page >= totalPages}
              onClick={() => setCurrentPage(page + 1)}
              className={cn(
                typographyVariants({ role: 'label' }),
                'max-desktop:size-8 max-desktop:rounded-md',
              )}
            >
              <ChevronRightIcon aria-hidden="true" />
            </PaginationButton>
          </PaginationItem>
        </PaginationContent>
      </PaginationRoot>
    </Card>
  );
}

export { SalesDetailsSection };
