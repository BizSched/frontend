import { SalesCategoryCard } from '@components/sales/SalesCategoryCard';
import { SalesChartCard } from '@components/sales/SalesChartCard';
import { SalesRecordsCard } from '@components/sales/SalesRecordsCard';
import { SalesSummaryCard } from '@components/sales/SalesSummaryCard';

import {
  SALES_CATEGORIES,
  SALES_RECORDS,
  SALES_WEEKS,
} from './salesDashboardData';

function SalesDashboard() {
  return (
    <main className="w-full max-w-[1416px] px-12 pt-[100px] pb-12 max-desktop:px-8 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-5">
      <div className="mb-6 flex items-center justify-between px-2 max-tablet:hidden">
        <h1 className="text-2xl font-semibold text-slate-950">매출 대시보드</h1>
        <span className="flex h-11 items-center rounded-full bg-primary-500 px-5 text-sm font-semibold text-white-50">
          <span aria-hidden="true" className="mr-2 text-xl">
            +
          </span>
          오늘 매출 입력
        </span>
      </div>

      <div className="grid grid-cols-3 gap-[31px] max-tablet:grid-cols-2 max-tablet:gap-3">
        <SalesSummaryCard
          title="이번달 누적"
          value="0 원"
          caption="25.10.01 ~ 25.10.31"
          className="max-tablet:col-span-2"
        />
        <SalesSummaryCard
          title="전월 대비 증감"
          value="+ 0.0 %"
          caption="전월 동기간 0원"
          isAccent
        />
        <SalesSummaryCard
          title="전년 대비"
          value="+ 0 원"
          caption="작년 동기간 0원"
          isAccent
        />
      </div>

      <div className="mt-[31px] grid grid-cols-[minmax(0,2.075fr)_minmax(0,1fr)] gap-[31px] max-tablet:flex max-tablet:flex-col max-tablet:gap-3">
        <SalesChartCard weeks={SALES_WEEKS} />
        <SalesCategoryCard categories={SALES_CATEGORIES} />
      </div>

      <SalesRecordsCard records={SALES_RECORDS} />

      <span
        aria-hidden="true"
        className="fixed right-5 bottom-5 hidden size-14 items-center justify-center rounded-full bg-primary-500 text-3xl text-white-50 shadow-[0_4px_16px_rgba(255,158,89,0.2)] max-tablet:flex"
      >
        +
      </span>
    </main>
  );
}

export { SalesDashboard };
