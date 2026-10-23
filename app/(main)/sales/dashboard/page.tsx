import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { SalesEntryButton } from '@components/sales/form/SalesEntryButton/SalesEntryButton';
import { SalesCategoryCard } from '@components/sales/SalesCategoryCard';
import { SalesChartCard } from '@components/sales/SalesChartCard';
import { SalesRecordsCard } from '@components/sales/SalesRecordsCard';
import { SalesSummaryCards } from '@components/sales/SalesSummaryCards';

import {
  salesChartQueryOptions,
  salesListQueryOptions,
  salesRatioQueryOptions,
  salesSummaryQueryOptions,
} from '@hooks/api/sales/salesQueryOptions';
import { salesCategoryListQueryOptions } from '@hooks/api/sales-category/salesCategoryQueryOptions';

import { getServerQueryClient } from '@providers/query/getServerQueryClient';

import { getAuthHeaders } from '@lib/api/getAuthHeaders';
import { cn } from '@lib/utilities/cn';
import {
  getCurrentSalesDate,
  getCurrentSalesMonth,
} from '@lib/utilities/sales/salesMonth';
import { typographyVariants } from '@lib/utilities/typography';

export const metadata: Metadata = {
  title: '매출 대시보드',
};

async function SalesPage() {
  const month = getCurrentSalesMonth();
  const date = getCurrentSalesDate();
  const queryClient = getServerQueryClient();
  const options = { headers: await getAuthHeaders() };

  await Promise.all([
    queryClient.prefetchQuery(salesSummaryQueryOptions({ month }, options)),
    queryClient.prefetchQuery(
      salesChartQueryOptions({ unit: 'MONTH', date }, options),
    ),
    queryClient.prefetchQuery(salesRatioQueryOptions({ month }, options)),
    queryClient.prefetchQuery(
      salesListQueryOptions({ page: 1, size: 8 }, options),
    ),
    queryClient.prefetchQuery(salesCategoryListQueryOptions(options)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1 p-6 pt-25 pb-12 max-desktop:px-8 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-5">
        <div className="mx-auto w-full max-w-330">
          <div className="mb-6 flex items-center justify-between px-2 max-tablet:hidden">
            <h1
              className={cn(
                typographyVariants({ role: 'pageTitle' }),
                'text-slate-950',
              )}
            >
              매출 대시보드
            </h1>
            <SalesEntryButton />
          </div>

          <SalesSummaryCards month={month} />

          <div className="mt-[31px] grid grid-cols-[minmax(0,2.075fr)_minmax(0,1fr)] gap-[31px] max-laptop:grid-cols-1">
            <SalesChartCard month={month} date={date} />
            <SalesCategoryCard month={month} />
          </div>

          <SalesRecordsCard />
        </div>
      </main>
    </HydrationBoundary>
  );
}

export default SalesPage;
