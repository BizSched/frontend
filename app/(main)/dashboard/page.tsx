import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';

import { DashboardHeader } from '@components/dashboard/DashboardHeader';
import { SalesChartSection } from '@components/dashboard/SalesChartSection/SalesChartSection';
import { TodayWorkerSection } from '@components/dashboard/TodayWorkerSection/TodayWorkerSection';

import { salesChartQueryOptions } from '@hooks/api/sales/salesQueryOptions';
import { scheduleListQueryOptions } from '@hooks/api/schedule/scheduleQueryOptions';
import { meQueryOptions } from '@hooks/api/users/userQueryOptions';

import { getServerQueryClient } from '@providers/query/getServerQueryClient';

import { getAuthHeaders } from '@lib/api/getAuthHeaders';
import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';

export const metadata: Metadata = {
  title: '대시보드',
};

async function DashboardPage() {
  const today = formatCalendarDate(new Date());
  const queryClient = getServerQueryClient();
  const options = { headers: await getAuthHeaders() };

  await Promise.all([
    queryClient.prefetchQuery(
      scheduleListQueryOptions({ from: today, to: today }, options),
    ),
    queryClient.prefetchQuery(
      salesChartQueryOptions({ unit: 'MONTH', date: today }, options),
    ),
    queryClient.prefetchQuery(meQueryOptions(options)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1 p-6 pt-25 max-desktop:pt-12 max-tablet:p-4">
        <div className="mx-auto w-full max-w-330 space-y-6">
          <DashboardHeader />
          <TodayWorkerSection today={today} />
          <SalesChartSection date={today} />
        </div>
      </main>
    </HydrationBoundary>
  );
}
export default DashboardPage;
