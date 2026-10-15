'use client';

import Image from 'next/image';

import { Card } from '@components/_common/Card/Card';

import { useSalesChart } from '@hooks/api/sales/useSalesChart';

import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

import Plus from '@assets/icons/ic_plus-white.svg';

import { SalesWeeklyChart } from './SalesWeeklyChart';

interface SalesChartCardProps {
  month: string;
  date: string;
}

function SalesChartCard({ month, date }: SalesChartCardProps) {
  const { data, error } = useSalesChart({ unit: 'MONTH', date });
  const monthLabel = `${Number(month.slice(5))}월`;

  return (
    <Card
      radius="2xl"
      padding="lg"
      className="relative h-[518px] gap-3 shadow-[0_0_30px_rgba(0,0,0,0.05)] max-laptop:order-2 max-tablet:h-[480px] max-tablet:overflow-visible max-tablet:p-5"
    >
      <Card.Header className="items-center max-tablet:items-start">
        <div className="flex items-center gap-3">
          <Card.Title className="text-2xl font-semibold text-slate-950 max-tablet:text-lg">
            매출 차트
          </Card.Title>
          <span className="rounded-full border border-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 max-tablet:text-xs">
            {monthLabel} <span aria-hidden="true">⌄</span>
          </span>
        </div>
        <div className="flex items-center rounded-lg bg-slate-50 p-[3px] text-xs font-medium max-tablet:hidden">
          <span className="px-3 py-2">주</span>
          <span className="rounded-md bg-primary-100 px-3 py-2 shadow-sm">
            월
          </span>
          <span className="px-3 py-2">연</span>
        </div>
      </Card.Header>

      <div className="hidden self-end rounded-lg bg-slate-50 p-[3px] text-xs font-medium max-tablet:flex">
        <span className="rounded-md bg-primary-100 px-3 py-2 shadow-sm">
          일간
        </span>
        <span className="px-3 py-2">주간</span>
        <span className="px-3 py-2">월간</span>
      </div>

      <span
        aria-hidden="true"
        className="absolute top-5 -right-3 hidden size-14 items-center justify-center rounded-full bg-primary-500 shadow-[0_4px_16px_rgba(255,158,89,0.2)] max-tablet:flex"
      >
        <Image src={Plus} alt="" width={24} height={24} />
      </span>

      {data ? (
        <SalesWeeklyChart chart={data} monthLabel={monthLabel} />
      ) : (
        <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
          {error ? formatSalesError(error) : '불러오는 중'}
        </p>
      )}
    </Card>
  );
}

export { SalesChartCard };
