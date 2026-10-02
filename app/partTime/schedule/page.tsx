import { connection } from 'next/server';

import { PartTimeScheduleActionButtons } from '@components/partTime/schedule/PartTimeScheduleActionButtons';
import { PartTimeScheduleCalendar } from '@components/partTime/schedule/PartTimeScheduleCalendar';
import { PartTimeScheduleHeader } from '@components/partTime/schedule/PartTimeScheduleHeader';

import { formatCalendarDate } from '@lib/utilities/calendar/calendarDate';

export default async function PartTimeSchedulePage() {
  await connection();

  const today = formatCalendarDate(new Date());

  return (
    <main className="flex-1 bg-[#f2f2f2] px-6 pt-25 pb-13 max-tablet:pt-12 max-tablet:pb-6 max-mobile:bg-white-50 max-mobile:px-0 max-mobile:pt-0 max-mobile:pb-40">
      <div className="mx-auto flex w-full max-w-330 flex-col gap-6">
        <PartTimeScheduleHeader />
        <PartTimeScheduleCalendar
          today={today}
          initialMonth={today.slice(0, 7)}
        />
      </div>
      <PartTimeScheduleActionButtons />
    </main>
  );
}
