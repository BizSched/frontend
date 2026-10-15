'use client';

import Link from 'next/link';

import { Card } from '@components/_common/Card/Card';
import { Table } from '@components/_common/Table/Table';

import { useSalesList } from '@hooks/api/sales/useSalesList';
import { useSalesCategoryList } from '@hooks/api/sales-category/useSalesCategoryList';

import { ROUTE_PATHS } from '@lib/utilities/routePaths';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

const RECENT_SIZE = 8;

const formatAmount = (amount: number) => amount.toLocaleString('ko-KR');

const formatDate = (date: string) => {
  const [, month, day] = date.split('-');
  const weekday = '일월화수목금토'[new Date(date).getUTCDay()];

  return {
    label: `${Number(month)}월 ${Number(day)}일`,
    weekday,
  };
};

function SalesRecordsCard() {
  const { data: list, error: listError } = useSalesList({
    page: 1,
    size: RECENT_SIZE,
  });
  const { data: categories, error: categoryError } = useSalesCategoryList();
  const error = listError ?? categoryError;

  const renderBody = () => {
    if (!list || !categories) {
      return (
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
          {error ? formatSalesError(error) : '불러오는 중'}
        </p>
      );
    }

    if (list.items.length === 0) {
      return (
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
          등록된 매출 내역이 없습니다
        </p>
      );
    }

    return (
      <>
        <div className="flex-1 max-tablet:hidden">
          <Table aria-label="입력한 매출" className="table-fixed">
            <Table.Header>
              <Table.Row className="border-b border-slate-100 hover:bg-transparent">
                <Table.Head className="text-xs text-slate-400">날짜</Table.Head>
                {categories.map((category) => (
                  <Table.Head
                    key={category.id}
                    className="text-xs text-slate-400"
                  >
                    {category.name}
                  </Table.Head>
                ))}
                <Table.Head className="text-xs text-slate-400">합계</Table.Head>
                <Table.Head className="text-xs text-slate-400" />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {list.items.map((sale) => {
                const { label, weekday } = formatDate(sale.date);

                return (
                  <Table.Row key={sale.id} className="h-[59px] border-slate-50">
                    <Table.Cell className="text-sm font-semibold text-slate-950">
                      {label}{' '}
                      <span className="text-xs font-medium text-slate-300">
                        {weekday}
                      </span>
                    </Table.Cell>
                    {categories.map((category) => (
                      <Table.Cell
                        key={category.id}
                        className="text-right text-sm text-slate-500"
                      >
                        {formatAmount(
                          sale.sales.find(
                            (item) => item.categoryId === category.id,
                          )?.amount ?? 0,
                        )}
                      </Table.Cell>
                    ))}
                    <Table.Cell className="text-right text-sm font-semibold text-slate-950">
                      ₩{formatAmount(sale.totalAmount)}
                    </Table.Cell>
                    <Table.Cell className="text-right text-xs text-slate-400">
                      수정
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>

        <div className="hidden flex-1 max-tablet:block">
          <div className="flex justify-between border-b border-slate-100 pb-2 text-xs text-slate-400">
            <span>날짜</span>
            <span>합계</span>
          </div>
          {list.items.map((sale) => {
            const { label, weekday } = formatDate(sale.date);

            return (
              <div
                key={sale.id}
                className="flex h-[57px] items-center justify-between border-b border-slate-50 text-xs"
              >
                <span className="font-semibold text-slate-950">
                  {label} <small className="text-slate-300">{weekday}</small>
                </span>
                <span className="font-semibold text-slate-950">
                  ₩{formatAmount(sale.totalAmount)}{' '}
                  <small className="ml-1 font-normal text-slate-400">
                    수정
                  </small>
                </span>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const recentTotal = list?.items.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0,
  );

  return (
    <Card
      radius="2xl"
      padding="lg"
      className="mt-[31px] min-h-[720px] gap-5 shadow-[0_0_30px_rgba(0,0,0,0.05)] max-tablet:mt-3 max-tablet:min-h-[610px] max-tablet:p-5"
    >
      <Card.Header className="items-center">
        <Card.Title className="text-2xl font-semibold text-slate-900 max-tablet:text-lg">
          입력한 매출
        </Card.Title>
        <Link
          href={ROUTE_PATHS.salesDetails()}
          className="rounded text-sm font-medium text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none max-tablet:text-xs"
        >
          모두 보기 <span aria-hidden="true">›</span>
        </Link>
      </Card.Header>

      {renderBody()}

      <Card.Footer className="flex justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span>최근 {list?.items.length ?? 0}일</span>
        <strong className="font-semibold text-slate-950">
          합계 ₩{formatAmount(recentTotal ?? 0)}
        </strong>
      </Card.Footer>
    </Card>
  );
}

export { SalesRecordsCard };
