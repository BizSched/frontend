'use client';

import { Card } from '@components/_common/Card/Card';

import { useSalesRatio } from '@hooks/api/sales/useSalesRatio';

import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

import { SalesCategoryDonut } from './SalesCategoryDonut';

interface SalesCategoryCardProps {
  month: string;
}

function SalesCategoryCard({ month }: SalesCategoryCardProps) {
  const { data, error } = useSalesRatio({ month });
  const monthLabel = `${Number(month.slice(5))}월`;

  const renderBody = () => {
    if (!data) {
      return (
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500 max-tablet:text-xs">
          {error ? formatSalesError(error) : '불러오는 중'}
        </p>
      );
    }

    if (data.totalAmount === 0) {
      return (
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500 max-tablet:text-xs">
          아직 입력된 매출이 없습니다
        </p>
      );
    }

    return (
      <>
        <div className="flex min-h-0 flex-1 items-center justify-center max-tablet:hidden">
          <SalesCategoryDonut ratio={data} />
        </div>
        <div className="hidden min-h-0 flex-1 items-center justify-center max-tablet:flex">
          <SalesCategoryDonut ratio={data} isCompact />
        </div>
      </>
    );
  };

  return (
    <Card
      radius="2xl"
      padding="lg"
      className="h-[518px] shadow-[0_0_30px_rgba(0,0,0,0.05)] max-laptop:order-1 max-tablet:h-[305px] max-tablet:p-5"
    >
      <Card.Header className="flex-col gap-0">
        <Card.Title className="text-2xl font-semibold text-slate-900 max-tablet:text-lg">
          카테고리 구성
        </Card.Title>
        <p className="text-base font-semibold text-slate-500 max-tablet:text-xs">
          {monthLabel} 누계
        </p>
      </Card.Header>

      {renderBody()}
    </Card>
  );
}

export { SalesCategoryCard };
