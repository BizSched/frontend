'use client';

import { useSalesSummary } from '@hooks/api/sales/useSalesSummary';

import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

import { SalesSummaryCard } from './SalesSummaryCard';

interface SalesSummaryCardsProps {
  month: string;
}

const formatAmount = (amount: number) => amount.toLocaleString('ko-KR');
const formatSignedAmount = (amount: number) =>
  `${amount >= 0 ? '+' : ''}${formatAmount(amount)} 원`;
const formatPeriod = (date: string) => date.replaceAll('-', '.');

function SalesSummaryCards({ month }: SalesSummaryCardsProps) {
  const { data, error } = useSalesSummary({ month });

  if (!data) {
    const message = error ? formatSalesError(error) : '불러오는 중';

    return (
      <div className="grid grid-cols-3 gap-6 max-laptop:grid-cols-2 max-laptop:gap-3">
        <SalesSummaryCard
          title="이번 달 누적"
          value={message}
          caption=""
          className="max-laptop:col-span-2"
        />
        <SalesSummaryCard
          title="전월 대비 증감"
          value={message}
          caption=""
          isAccent
        />
        <SalesSummaryCard
          title="전년 대비"
          value={message}
          caption=""
          isAccent
        />
      </div>
    );
  }

  const { changeRate } = data.previousMonth;

  return (
    <div className="grid grid-cols-3 gap-6 max-laptop:grid-cols-2 max-laptop:gap-3">
      <SalesSummaryCard
        title="이번 달 누적"
        value={`${formatAmount(data.totalAmount)} 원`}
        caption={`${formatPeriod(data.startDate)} ~ ${formatPeriod(data.endDate)}`}
        className="max-laptop:col-span-2"
      />
      <SalesSummaryCard
        title="전월 대비 증감"
        value={
          changeRate === null
            ? '-'
            : `${changeRate >= 0 ? '+' : ''}${changeRate.toFixed(1)} %`
        }
        caption={
          changeRate === null
            ? '비교할 데이터 없음'
            : `전월 동기간 ${formatAmount(data.previousMonth.totalAmount)}원`
        }
        isAccent
      />
      <SalesSummaryCard
        title="전년 대비"
        value={formatSignedAmount(data.previousYear.changeAmount)}
        caption={`작년 동기간 ${formatAmount(data.previousYear.totalAmount)}원`}
        isAccent
      />
    </div>
  );
}

export { SalesSummaryCards };
