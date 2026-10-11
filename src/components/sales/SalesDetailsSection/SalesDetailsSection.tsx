'use client';

import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { Card } from '@components/_common/Card/Card';
import { MonthSelectDropdown } from '@components/_common/MonthSelectDropdown/MonthSelectDropdown';
import { PaginationButton } from '@components/_common/Pagination/PaginationButton';
import { PaginationContent } from '@components/_common/Pagination/PaginationContent';
import { PaginationItem } from '@components/_common/Pagination/PaginationItem';
import { PaginationRoot } from '@components/_common/Pagination/PaginationRoot';
import { Table } from '@components/_common/Table/Table';

import { useSalesList } from '@hooks/api/sales/useSalesList';
import { useSalesMonthTotal } from '@hooks/api/sales/useSalesMonthTotal';
import { useSalesCategoryList } from '@hooks/api/sales-category/useSalesCategoryList';
import { usePageSearchParam } from '@hooks/pagination/usePageSearchParam';

import { formatSalesError } from '@lib/utilities/sales/formatSalesError';
import { isSalesMonth } from '@lib/utilities/sales/salesMonth';

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
              className="max-desktop:min-w-0 max-desktop:gap-1 max-desktop:text-base"
            />
            <h2
              id="sales-month-title"
              className="text-xl leading-[29px] font-bold text-slate-950 max-desktop:text-lg max-desktop:leading-7"
            >
              매출
            </h2>
          </div>
          <span className="text-xs leading-4 font-medium text-slate-500">
            월 전체 합계
          </span>
        </div>
        <p className="text-right text-base leading-6 font-bold text-slate-800 max-desktop:text-sm max-tablet:text-base">
          합계{' '}
          {monthTotal === undefined
            ? '-'
            : `${NUMBER_FORMAT.format(monthTotal)} 원`}
        </p>
      </div>

      <div className="border-b border-slate-500 pb-2">
        {isError ? (
          <div className="py-8 text-center text-sm text-slate-500">
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
          <p className="py-8 text-center text-sm text-slate-500">
            매출 내역을 불러오는 중입니다.
          </p>
        ) : salesList && salesList.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            등록된 매출 내역이 없습니다.
          </p>
        ) : (
          <Table
            aria-label="날짜별 매출 내역"
            className="table-fixed text-sm max-desktop:text-xs"
          >
            <Table.Header>
              <Table.Row className="border-slate-200 hover:bg-transparent">
                <Table.Head
                  scope="col"
                  className="h-auto w-[118px] px-0 pb-1 text-xs leading-[17px] text-slate-500 max-desktop:w-[76px]"
                >
                  날짜
                </Table.Head>
                {categories?.map((category) => (
                  <Table.Head
                    key={category.id}
                    scope="col"
                    className="h-auto px-1 pb-1 text-right text-xs leading-[17px] text-slate-500 max-tablet:hidden"
                  >
                    {category.name}
                  </Table.Head>
                ))}
                <Table.Head
                  scope="col"
                  className="h-auto w-[118px] px-0 pb-1 text-right text-xs leading-[17px] text-slate-500 max-desktop:w-[86px] max-tablet:w-auto"
                >
                  합계
                </Table.Head>
                <Table.Head
                  scope="col"
                  className="h-auto w-[52px] p-0 max-desktop:w-7"
                >
                  <span className="sr-only">내역 수정</span>
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {salesList?.items.map((sale) => {
                const saleDate = parseISO(sale.date);
                return (
                  <Table.Row
                    key={sale.id}
                    className="h-[59px] border-slate-50 hover:bg-transparent max-desktop:h-[55px]"
                  >
                    <Table.Head
                      scope="row"
                      className="h-auto px-0 py-3.5 text-sm font-semibold text-slate-950 max-desktop:text-xs"
                    >
                      <time dateTime={sale.date}>
                        {format(saleDate, 'M월 d일', { locale: ko })}
                      </time>
                      <span className="ml-2 text-xs font-medium text-slate-300 max-desktop:ml-1 max-desktop:text-[10px]">
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
                          className="px-1 py-3.5 text-right font-medium text-slate-600 max-tablet:hidden"
                        >
                          {NUMBER_FORMAT.format(amount)}
                        </Table.Cell>
                      );
                    })}
                    <Table.Cell className="px-0 py-3.5 text-right font-medium text-slate-950">
                      ₩{NUMBER_FORMAT.format(sale.totalAmount)}
                    </Table.Cell>
                    <Table.Cell className="px-0 py-3.5 text-right">
                      <button
                        type="button"
                        aria-label={`${format(saleDate, 'M월 d일', { locale: ko })} 매출 수정`}
                        className="cursor-pointer rounded text-xs text-slate-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none max-desktop:text-[10px]"
                      >
                        수정
                      </button>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>

      <PaginationRoot aria-label="매출 내역 페이지" className="pb-6">
        <PaginationContent className="gap-1">
          <PaginationItem className="mr-1.5">
            <PaginationButton
              aria-label="이전 페이지"
              disabled={page <= 1}
              onClick={() => setCurrentPage(page - 1)}
              className="max-desktop:size-8 max-desktop:rounded-md max-desktop:text-xs"
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
                  className="max-desktop:size-8 max-desktop:rounded-md max-desktop:text-xs"
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
              className="max-desktop:size-8 max-desktop:rounded-md max-desktop:text-xs"
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
