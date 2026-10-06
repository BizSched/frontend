import type { Metadata } from 'next';

import { SalesEntryButton } from '@components/sales/form/SalesEntryButton/SalesEntryButton';
import { SalesCategoryCard } from '@components/sales/SalesCategoryCard';
import { SalesChartCard } from '@components/sales/SalesChartCard';
import {
  SALES_MONTH_TOTAL,
  SALES_PREVIOUS_MONTH_TOTAL,
  SALES_PREVIOUS_YEAR_TOTAL,
  SALES_MONTH_CHANGE,
  SALES_YEAR_CHANGE,
  SALES_PERIOD,
} from '@components/sales/salesDashboardData';
import { SalesRecordsCard } from '@components/sales/SalesRecordsCard';
import { SalesSummaryCard } from '@components/sales/SalesSummaryCard';

export const metadata: Metadata = {
  title: '매출 대시보드',
};

function SalesPage() {
  return (
    <main className="flex-1 p-6 pt-25 pb-12 max-desktop:px-8 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-5">
      <div className="mx-auto w-full max-w-330">
        <div className="mb-6 flex items-center justify-between px-2 max-tablet:hidden">
          <h1 className="text-2xl font-semibold text-slate-950">
            매출 대시보드
          </h1>
          <SalesEntryButton />
        </div>

        <div className="grid grid-cols-3 gap-6 max-laptop:grid-cols-2 max-laptop:gap-3">
          <SalesSummaryCard
            title="시연 월 누적"
            value={`${SALES_MONTH_TOTAL.toLocaleString('ko-KR')} 원`}
            caption={SALES_PERIOD}
            className="max-laptop:col-span-2"
          />
          <SalesSummaryCard
            title="전월 대비 증감"
            value={`${SALES_MONTH_CHANGE >= 0 ? '+' : ''}${SALES_MONTH_CHANGE.toFixed(1)} %`}
            caption={`전월 동기간 ${SALES_PREVIOUS_MONTH_TOTAL.toLocaleString('ko-KR')}원`}
            isAccent
          />
          <SalesSummaryCard
            title="전년 대비"
            value={`${SALES_YEAR_CHANGE >= 0 ? '+' : ''}${SALES_YEAR_CHANGE.toLocaleString('ko-KR')} 원`}
            caption={`작년 동기간 ${SALES_PREVIOUS_YEAR_TOTAL.toLocaleString('ko-KR')}원`}
            isAccent
          />
        </div>

        <div className="mt-[31px] grid grid-cols-[minmax(0,2.075fr)_minmax(0,1fr)] gap-[31px] max-laptop:grid-cols-1">
          <SalesChartCard />
          <SalesCategoryCard />
        </div>

        <SalesRecordsCard />
      </div>
    </main>
  );
}

export default SalesPage;
