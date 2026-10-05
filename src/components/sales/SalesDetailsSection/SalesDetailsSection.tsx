import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Card } from '@components/_common/Card/Card';
import { MonthDropdownButton } from '@components/_common/MonthDropdownButton/MonthDropdownButton';
import { PaginationButton } from '@components/_common/Pagination/PaginationButton';
import { PaginationContent } from '@components/_common/Pagination/PaginationContent';
import { PaginationItem } from '@components/_common/Pagination/PaginationItem';
import { PaginationRoot } from '@components/_common/Pagination/PaginationRoot';
import { Table } from '@components/_common/Table/Table';

const CATEGORIES = ['상품 판매', '서비스', '배달·온라인', '기타'];
const MOCK_SALES = [
  { day: 30, weekday: '수', amounts: [183400, 148700, 351900, 72300] },
  { day: 29, weekday: '화', amounts: [372000, 191500, 142900, 75600] },
  { day: 28, weekday: '월', amounts: [210000, 150000, 223200, 60000] },
  { day: 27, weekday: '일', amounts: [180000, 160000, 201500, 50000] },
  { day: 26, weekday: '토', amounts: [220000, 120000, 178400, 40000] },
  { day: 25, weekday: '금', amounts: [190000, 140000, 154900, 30000] },
  { day: 24, weekday: '목', amounts: [170000, 130000, 152100, 30000] },
  { day: 23, weekday: '수', amounts: [160000, 110000, 133600, 20000] },
  { day: 22, weekday: '화', amounts: [150000, 100000, 101800, 20000] },
  { day: 21, weekday: '월', amounts: [140000, 90000, 77900, 0] },
];
const NUMBER_FORMAT = new Intl.NumberFormat('ko-KR');
const MONTH_TOTAL = MOCK_SALES.reduce(
  (sum, sale) =>
    sum + sale.amounts.reduce((total, amount) => total + amount, 0),
  0,
);

function SalesDetailsSection() {
  return (
    <Card
      radius="2xl"
      padding="lg"
      className="gap-5 shadow-[0_0_30px_rgba(0,0,0,0.05)]"
    >
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MonthDropdownButton
              type="button"
              className="max-desktop:min-w-0 max-desktop:gap-1 max-desktop:text-base"
            >
              9월
            </MonthDropdownButton>
            <h2
              id="sales-month-title"
              className="text-xl leading-[29px] font-bold text-slate-950 max-desktop:text-lg max-desktop:leading-7"
            >
              매출
            </h2>
          </div>
          <span className="text-xs leading-4 font-medium text-slate-500">
            월 합계
          </span>
        </div>
        <p className="text-right text-base leading-6 font-bold text-slate-800 max-desktop:text-sm max-tablet:text-base">
          합계 {NUMBER_FORMAT.format(MONTH_TOTAL)} 원
        </p>
      </div>

      <div className="border-b border-slate-500 pb-2">
        <Table
          aria-label="9월 날짜별 매출 내역"
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
              {CATEGORIES.map((category) => (
                <Table.Head
                  key={category}
                  scope="col"
                  className="h-auto px-1 pb-1 text-right text-xs leading-[17px] text-slate-500 max-tablet:hidden"
                >
                  {category}
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
            {MOCK_SALES.map(({ day, weekday, amounts }) => (
              <Table.Row
                key={day}
                className="h-[59px] border-slate-50 hover:bg-transparent max-desktop:h-[55px]"
              >
                <Table.Head
                  scope="row"
                  className="h-auto px-0 py-3.5 text-sm font-semibold text-slate-950 max-desktop:text-xs"
                >
                  <time dateTime={`2026-09-${day}`}>9월 {day}일</time>
                  <span className="ml-2 text-xs font-medium text-slate-300 max-desktop:ml-1 max-desktop:text-[10px]">
                    {weekday}
                  </span>
                </Table.Head>
                {amounts.map((amount, index) => (
                  <Table.Cell
                    key={CATEGORIES[index]}
                    className="px-1 py-3.5 text-right font-medium text-slate-600 max-tablet:hidden"
                  >
                    {NUMBER_FORMAT.format(amount)}
                  </Table.Cell>
                ))}
                <Table.Cell className="px-0 py-3.5 text-right font-medium text-slate-950">
                  ₩
                  {NUMBER_FORMAT.format(
                    amounts.reduce((sum, amount) => sum + amount, 0),
                  )}
                </Table.Cell>
                <Table.Cell className="px-0 py-3.5 text-right">
                  <button
                    type="button"
                    aria-label={`9월 ${day}일 매출 수정`}
                    className="cursor-pointer rounded text-xs text-slate-400 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:outline-none max-desktop:text-[10px]"
                  >
                    수정
                  </button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <PaginationRoot aria-label="매출 내역 페이지" className="pb-6">
        <PaginationContent className="gap-1">
          <PaginationItem className="mr-1.5">
            <PaginationButton
              aria-label="이전 페이지"
              disabled
              className="max-desktop:size-8 max-desktop:rounded-md max-desktop:text-xs"
            >
              <ChevronLeftIcon aria-hidden="true" />
            </PaginationButton>
          </PaginationItem>
          {[1, 2, 3].map((page) => (
            <PaginationItem key={page}>
              <PaginationButton
                isActive={page === 1}
                aria-label={`${page}페이지`}
                className="max-desktop:size-8 max-desktop:rounded-md max-desktop:text-xs"
              >
                {page}
              </PaginationButton>
            </PaginationItem>
          ))}
          <PaginationItem className="ml-1.5">
            <PaginationButton
              aria-label="다음 페이지"
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
