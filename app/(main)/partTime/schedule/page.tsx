import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { connection } from 'next/server';

import { PartTimeScheduleActionButtons } from '@components/partTime/schedule/PartTimeScheduleActionButtons';
import { PartTimeScheduleCalendar } from '@components/partTime/schedule/PartTimeScheduleCalendar';
import { PartTimeScheduleHeader } from '@components/partTime/schedule/PartTimeScheduleHeader';

import { scheduleListQueryOptions } from '@hooks/api/schedule/scheduleQueryOptions';
import { staffOptionsQueryOptions } from '@hooks/api/staff/staffQueryOptions';

import { PartTimeScheduleImageProvider } from '@providers/partTime/PartTimeScheduleImageProvider';
import { getServerQueryClient } from '@providers/query/getServerQueryClient';

import { getAuthHeaders } from '@lib/api/getAuthHeaders';
import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';
import { getPartTimeScheduleRange } from '@lib/utilities/partTime/partTimeSchedule';

export const metadata: Metadata = {
  title: '아르바이트생 스케줄 관리',
};

export default async function PartTimeSchedulePage() {
  await connection();

  const today = formatCalendarDate(new Date());
  const initialMonth = today.slice(0, 7);
  const queryClient = getServerQueryClient();
  const options = { headers: await getAuthHeaders() };
  await Promise.all([
    queryClient.prefetchQuery(
      scheduleListQueryOptions(getPartTimeScheduleRange(initialMonth), options),
    ),
    queryClient.prefetchQuery(staffOptionsQueryOptions(undefined, options)),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex-1 bg-[#f2f2f2] px-6 pt-25 pb-13 max-desktop:pt-12 max-tablet:pb-6 max-mobile:bg-white-50 max-mobile:px-0 max-mobile:pt-0 max-mobile:pb-40">
        <PartTimeScheduleImageProvider>
          <div className="mx-auto flex w-full max-w-330 flex-col gap-6">
            <PartTimeScheduleHeader />
            <PartTimeScheduleCalendar
              today={today}
              initialMonth={initialMonth}
            />
          </div>
          <PartTimeScheduleActionButtons />
        </PartTimeScheduleImageProvider>
      </main>
    </HydrationBoundary>
  );
}
