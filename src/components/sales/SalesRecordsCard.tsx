import { Card } from '@components/_common/Card/Card';
import { Table } from '@components/_common/Table/Table';

import { SALES_RECORDS } from './salesDashboardData';

const formatAmount = (amount: number) => amount.toLocaleString('ko-KR');

function SalesRecordsCard() {
  const records = SALES_RECORDS;
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
        <span className="text-sm font-medium text-primary-700 max-tablet:text-xs">
          모두 보기 <span aria-hidden="true">›</span>
        </span>
      </Card.Header>

      <div className="flex-1 max-tablet:hidden">
        <Table aria-label="입력한 매출" className="table-fixed">
          <Table.Header>
            <Table.Row className="border-b border-slate-100 hover:bg-transparent">
              {[
                '날짜',
                '상품 판매',
                '서비스',
                '배달·온라인',
                '기타',
                '합계',
                '',
              ].map((heading) => (
                <Table.Head key={heading} className="text-xs text-slate-400">
                  {heading}
                </Table.Head>
              ))}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {records.map((record) => (
              <Table.Row key={record.id} className="h-[59px] border-slate-50">
                <Table.Cell className="text-sm font-semibold text-slate-950">
                  {record.date}{' '}
                  <span className="text-xs font-medium text-slate-300">
                    {record.day}
                  </span>
                </Table.Cell>
                <Table.Cell className="text-right text-sm text-slate-500">
                  {formatAmount(record.product)}
                </Table.Cell>
                <Table.Cell className="text-right text-sm text-slate-500">
                  {formatAmount(record.service)}
                </Table.Cell>
                <Table.Cell className="text-right text-sm text-slate-500">
                  {formatAmount(record.online)}
                </Table.Cell>
                <Table.Cell className="text-right text-sm text-slate-500">
                  {formatAmount(record.other)}
                </Table.Cell>
                <Table.Cell className="text-right text-sm font-semibold text-slate-950">
                  ₩{formatAmount(record.total)}
                </Table.Cell>
                <Table.Cell className="text-right text-xs text-slate-400">
                  수정
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </div>

      <div className="hidden flex-1 max-tablet:block">
        <div className="flex justify-between border-b border-slate-100 pb-2 text-xs text-slate-400">
          <span>날짜</span>
          <span>합계</span>
        </div>
        {records.map((record) => (
          <div
            key={record.id}
            className="flex h-[57px] items-center justify-between border-b border-slate-50 text-xs"
          >
            <span className="font-semibold text-slate-950">
              {record.date}{' '}
              <small className="text-slate-300">{record.day}</small>
            </span>
            <span className="font-semibold text-slate-950">
              ₩{formatAmount(record.total)}{' '}
              <small className="ml-1 font-normal text-slate-400">수정</small>
            </span>
          </div>
        ))}
      </div>

      <Card.Footer className="flex justify-between border-t border-slate-100 pt-4 text-xs text-slate-400">
        <span>최근 8일</span>
        <strong className="font-semibold text-slate-950">
          합계 ₩5,431,700
        </strong>
      </Card.Footer>
    </Card>
  );
}

export { SalesRecordsCard };
