import type { Metadata } from 'next';
import { connection } from 'next/server';
import { Suspense } from 'react';

import { PartTimeStaffActionButtons } from '@components/partTime/staff/PartTimeStaffActionButtons';
import { PartTimeStaffHeader } from '@components/partTime/staff/PartTimeStaffHeader';
import { PartTimeStaffList } from '@components/partTime/staff/PartTimeStaffList';

import { formatPartTimeStaffNow } from '@lib/utilities/partTime/partTimeStaff';

export const metadata: Metadata = {
  title: '아르바이트생 관리',
};

export default async function PartTimeStaffPage() {
  await connection();

  const now = formatPartTimeStaffNow(new Date());

  return (
    <main className="flex flex-1 flex-col bg-[#f2f2f2] px-6 pt-25 pb-13 max-desktop:pt-12 max-tablet:pb-6 max-mobile:px-3 max-mobile:pt-6 max-mobile:pb-22">
      <div className="mx-auto flex w-full max-w-330 flex-1 flex-col gap-7">
        <PartTimeStaffHeader />
        <Suspense>
          <PartTimeStaffList now={now} />
        </Suspense>
      </div>
      <PartTimeStaffActionButtons />
    </main>
  );
}
