import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';
import { getPartTimeStaffDetailMock } from '@components/partTime/staff/partTimeStaffMock';

export const metadata: Metadata = {
  title: '아르바이트생 정보 수정하기',
};

const STAFF_ID_PATTERN = /^\d+$/;

export default async function PartTimeStaffEditPage({
  params,
}: PageProps<'/partTime/staff/[id]/edit'>) {
  const { id } = await params;
  const staff = STAFF_ID_PATTERN.test(id)
    ? getPartTimeStaffDetailMock(Number(id))
    : undefined;

  if (!staff) {
    notFound();
  }

  return (
    <main className="flex flex-1 bg-[#f2f2f2]">
      <PartTimeStaffForm staff={staff} />
    </main>
  );
}
