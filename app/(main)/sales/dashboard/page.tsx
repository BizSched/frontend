import Image from 'next/image';

import { SalesCategoryCard } from '@components/sales/SalesCategoryCard';
import { SalesChartCard } from '@components/sales/SalesChartCard';
import { SalesRecordsCard } from '@components/sales/SalesRecordsCard';
import { SalesSummaryCard } from '@components/sales/SalesSummaryCard';

import Plus from '@assets/icons/ic_plus-white.svg';

function SalesPage() {
  return (
    <main className="mx-auto w-full max-w-[1320px] p-6 pt-[100px] pb-12 max-desktop:px-8 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-5">
      <div className="mb-6 flex items-center justify-between px-2 max-tablet:hidden">
        <h1 className="text-2xl font-semibold text-slate-950">매출 대시보드</h1>
        <span className="flex h-11 items-center rounded-full bg-primary-500 px-5 text-sm font-semibold text-white-50">
          <Image src={Plus} alt="" width={16} height={16} className="mr-2" />
          오늘 매출 입력
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6 max-laptop:grid-cols-2 max-laptop:gap-3">
        <SalesSummaryCard
          title="이번달 누적"
          value="0 원"
          caption="25.10.01 ~ 25.10.31"
          className="max-laptop:col-span-2"
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

      <div className="mt-[31px] grid grid-cols-[minmax(0,2.075fr)_minmax(0,1fr)] gap-[31px] max-laptop:grid-cols-1">
        <SalesChartCard />
        <SalesCategoryCard />
      </div>

      <SalesRecordsCard />
    </main>
  );
}

export default SalesPage;
