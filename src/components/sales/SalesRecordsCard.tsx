'use client';

import { MoveRight } from 'lucide-react';
import Link from 'next/link';

import { Card } from '@components/_common/Card/Card';
import { Table } from '@components/_common/Table/Table';

import { useSalesList } from '@hooks/api/sales/useSalesList';
import { useSalesCategoryList } from '@hooks/api/sales-category/useSalesCategoryList';

import { cn } from '@lib/utilities/cn';
import { ROUTE_PATHS } from '@lib/utilities/routePaths';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';
import { typographyVariants } from '@lib/utilities/typography';

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
        <p
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'flex flex-1 items-center justify-center text-slate-500',
          )}
        >
          {error ? formatSalesError(error) : '불러오는 중'}
        </p>
      );
    }

    if (list.items.length === 0) {
      return (
        <p
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'flex flex-1 items-center justify-center text-slate-500',
          )}
        >
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
                <Table.Head
                  className={cn(
                    typographyVariants({ role: 'label' }),
                    'text-slate-400',
                  )}
                >
                  날짜
                </Table.Head>
                {categories.map((category) => (
                  <Table.Head
                    key={category.id}
                    className={cn(
                      typographyVariants({ role: 'label' }),
                      'text-slate-400',
                    )}
                  >
                    {category.name}
                  </Table.Head>
                ))}
                <Table.Head
                  className={cn(
                    typographyVariants({ role: 'label' }),
                    'text-slate-400',
                  )}
                >
                  합계
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {list.items.map((sale) => {
                const { label, weekday } = formatDate(sale.date);

                return (
                  <Table.Row key={sale.id} className="h-[59px] border-slate-50">
                    <Table.Cell
                      className={cn(
                        typographyVariants({ role: 'subtitle' }),
                        'text-slate-950',
                      )}
                    >
                      {label}{' '}
                      <span
                        className={cn(
                          typographyVariants({ role: 'caption' }),
                          'text-slate-400',
                        )}
                      >
                        {weekday}
                      </span>
                    </Table.Cell>
                    {categories.map((category) => (
                      <Table.Cell
                        key={category.id}
                        className={cn(
                          typographyVariants({ role: 'data' }),
                          'text-right text-slate-500',
                        )}
                      >
                        {formatAmount(
                          sale.sales.find(
                            (item) => item.categoryId === category.id,
                          )?.amount ?? 0,
                        )}
                      </Table.Cell>
                    ))}
                    <Table.Cell
                      className={cn(
                        typographyVariants({ role: 'data' }),
                        'text-right text-slate-950',
                      )}
                    >
                      ₩{formatAmount(sale.totalAmount)}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>

        <div className="hidden flex-1 max-tablet:block">
          <div
            className={cn(
              typographyVariants({ role: 'label' }),
              'flex justify-between border-b border-slate-100 pb-2 text-slate-400',
            )}
          >
            <span>날짜</span>
            <span>합계</span>
          </div>
          {list.items.map((sale) => {
            const { label, weekday } = formatDate(sale.date);

            return (
              <div
                key={sale.id}
                className={cn(
                  typographyVariants({ role: 'data' }),
                  'flex h-[57px] items-center justify-between border-b border-slate-50',
                )}
              >
                <span className="font-semibold text-slate-950">
                  {label}{' '}
                  <small
                    className={cn(
                      typographyVariants({ role: 'caption' }),
                      'text-slate-400',
                    )}
                  >
                    {weekday}
                  </small>
                </span>
                <span className="font-semibold text-slate-950">
                  ₩{formatAmount(sale.totalAmount)}
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
        <Card.Title
          className={cn(
            typographyVariants({ role: 'sectionTitle' }),
            'text-slate-900',
          )}
        >
          입력한 매출
        </Card.Title>
        <Link
          href={ROUTE_PATHS.salesDetails()}
          className={cn(
            typographyVariants({ role: 'label' }),
            'flex items-center gap-1 rounded text-primary-700 hover:underline focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none',
          )}
        >
          모두 보기
          <MoveRight aria-hidden="true" size={16} />
        </Link>
      </Card.Header>

      {renderBody()}

      <Card.Footer
        className={cn(
          typographyVariants({ role: 'supporting' }),
          'flex justify-between border-t border-slate-100 pt-4 text-slate-400',
        )}
      >
        <span>최근 {list?.items.length ?? 0}일</span>
        <strong className="font-semibold text-slate-950">
          합계 ₩{formatAmount(recentTotal ?? 0)}
        </strong>
      </Card.Footer>
    </Card>
  );
}

export { SalesRecordsCard };
