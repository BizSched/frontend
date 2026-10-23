import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { SalesDetailsHeader } from '@components/sales/SalesDetailsHeader/SalesDetailsHeader';
import { SalesDetailsMobileActions } from '@components/sales/SalesDetailsMobileActions/SalesDetailsMobileActions';
import { SalesDetailsSection } from '@components/sales/SalesDetailsSection/SalesDetailsSection';

import {
  salesListQueryOptions,
  salesMonthTotalQueryOptions,
} from '@hooks/api/sales/salesQueryOptions';
import { salesCategoryListQueryOptions } from '@hooks/api/sales-category/salesCategoryQueryOptions';

import { getServerQueryClient } from '@providers/query/getServerQueryClient';

import { getAuthHeaders } from '@lib/api/getAuthHeaders';
import {
  getCurrentSalesMonth,
  isSalesMonth,
} from '@lib/utilities/sales/salesMonth';

const PAGE_SIZE = 10;

interface SalesDetailPageProps {
  searchParams: Promise<{ month?: string; page?: string }>;
}

export const metadata: Metadata = {
  title: '매출 내역',
};

async function SalesDetailPage({ searchParams }: SalesDetailPageProps) {
  const params = await searchParams;
  const month = isSalesMonth(params.month)
    ? params.month
    : getCurrentSalesMonth();
  const pageNumber = Number(params.page);
  const page = Number.isInteger(pageNumber) && pageNumber >= 1 ? pageNumber : 1;
  const queryClient = getServerQueryClient();
  const options = { headers: await getAuthHeaders() };

  await Promise.all([
    queryClient.prefetchQuery(
      salesListQueryOptions({ month, page, size: PAGE_SIZE }, options),
    ),
    queryClient.prefetchQuery(salesMonthTotalQueryOptions({ month }, options)),
    queryClient.prefetchQuery(salesCategoryListQueryOptions(options)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1 px-6 pt-25 pb-8 max-desktop:pt-12 max-tablet:px-3 max-tablet:pt-6 max-tablet:pb-24">
        <div className="mx-auto w-full max-w-330 space-y-6">
          <SalesDetailsHeader />

          <SalesDetailsSection initialMonth={month} />

          <SalesDetailsMobileActions />
        </div>
      </main>
    </HydrationBoundary>
  );
}

export default SalesDetailPage;
