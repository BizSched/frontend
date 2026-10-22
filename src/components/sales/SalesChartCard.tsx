'use client';

import { PlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Card } from '@components/_common/Card/Card';
import { MonthSelectDropdown } from '@components/_common/MonthSelectDropdown/MonthSelectDropdown';

import { useSalesChart } from '@hooks/api/sales/useSalesChart';

import { cn } from '@lib/utilities/cn';
import { formatSalesError } from '@lib/utilities/sales/formatSalesError';

import { SalesWeeklyChart } from './SalesWeeklyChart';

interface SalesChartCardProps {
  month: string;
  date: string;
}

const CHART_TABS = [
  { unit: 'WEEK', desktop: '주', mobile: '주간' },
  { unit: 'MONTH', desktop: '월', mobile: '월간' },
  { unit: 'YEAR', desktop: '연', mobile: '연간' },
] as const;

function SalesChartCard({ month, date }: SalesChartCardProps) {
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [unit, setUnit] =
    useState<(typeof CHART_TABS)[number]['unit']>('MONTH');
  const chartDate = selectedMonth === month ? date : `${selectedMonth}-01`;
  const { data, error } = useSalesChart({ unit, date: chartDate });
  const monthLabel = `${Number(selectedMonth.slice(5))}월`;
  const handleMonthChange = (nextMonth: number) => {
    const next = `${month.slice(0, 4)}-${String(nextMonth).padStart(2, '0')}`;
    if (next === selectedMonth) return;
    setSelectedMonth(next);
    setUnit('MONTH');
  };

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
          <MonthSelectDropdown
            value={Number(selectedMonth.slice(5))}
            onChange={handleMonthChange}
            size="small"
            className="border-slate-100 px-3 py-1 text-sm font-semibold text-slate-800 max-tablet:text-xs"
          />
        </div>
        <div className="flex items-center rounded-lg bg-slate-50 p-[3px] text-xs font-medium max-tablet:hidden">
          {CHART_TABS.map((tab) => (
            <button
              key={tab.unit}
              type="button"
              aria-pressed={unit === tab.unit}
              onClick={() => setUnit(tab.unit)}
              className={cn(
                'cursor-pointer rounded-md px-3 py-2',
                unit === tab.unit && 'bg-primary-100 shadow-sm',
              )}
            >
              {tab.desktop}
            </button>
          ))}
        </div>
      </Card.Header>

      <div className="hidden self-end rounded-lg bg-slate-50 p-[3px] text-xs font-medium max-tablet:flex">
        {CHART_TABS.map((tab) => (
          <button
            key={tab.unit}
            type="button"
            aria-pressed={unit === tab.unit}
            onClick={() => setUnit(tab.unit)}
            className={cn(
              'cursor-pointer rounded-md px-3 py-2',
              unit === tab.unit && 'bg-primary-100 shadow-sm',
            )}
          >
            {tab.mobile}
          </button>
        ))}
      </div>

      <span
        aria-hidden="true"
        className="absolute top-5 -right-3 hidden size-14 items-center justify-center rounded-full bg-primary-500 shadow-[0_4px_16px_rgba(255,158,89,0.2)] max-tablet:flex"
      >
        <PlusIcon size={24} strokeWidth={1.5} className="text-white" />
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
