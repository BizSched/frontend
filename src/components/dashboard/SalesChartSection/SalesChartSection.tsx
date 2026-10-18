'use client';

import { MoveRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Card } from '@components/_common/Card/Card';
import { SalesWeeklyChart } from '@components/sales/SalesWeeklyChart';

import { useSalesChart } from '@hooks/api/sales/useSalesChart';

import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

import IcEmpty from '@assets/icons/ic_empty.svg';

interface SalesChartSectionProps {
  date: string;
}

function SalesChartSection({ date }: SalesChartSectionProps) {
  const { data, error } = useSalesChart({ unit: 'MONTH', date });
  const isEmpty = data?.rows.every(({ totalAmount }) => totalAmount === 0);

  return (
    <Card padding="lg" className="gap-6">
      <Card.Header>
        <Card.Title>이번 달 매출 차트</Card.Title>
        <Card.Title className="flex cursor-pointer items-center text-lg text-gray-500 underline">
          <Link href="/sales/dashboard" className="flex items-center">
            자세히 보기
            <MoveRight className="ml-2 text-gray-500" size={16} />
          </Link>
        </Card.Title>
      </Card.Header>

      <Card.Content className="flex min-h-[270px] flex-col max-tablet:min-h-0">
        {!data ? (
          <p className="flex flex-1 items-center justify-center text-sm text-slate-500">
            {error ? formatSalesError(error) : '불러오는 중'}
          </p>
        ) : isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Image src={IcEmpty} alt="" width={100} height={128} unoptimized />
            <span className="text-base font-semibold text-slate-400">
              매출 데이터가 없습니다
            </span>
          </div>
        ) : (
          <SalesWeeklyChart
            chart={data}
            monthLabel={`${Number(date.slice(5, 7))}월`}
          />
        )}
      </Card.Content>
    </Card>
  );
}

export { SalesChartSection };
