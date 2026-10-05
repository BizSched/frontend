import { notFound } from 'next/navigation';

import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';
import { getPartTimeStaffDetailMock } from '@components/partTime/staff/partTimeStaffMock';

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
    <main className="flex flex-1 flex-col bg-[#f2f2f2] px-6 pt-25 pb-13 max-laptop:pt-12 max-laptop:pb-6 max-tablet:px-4 max-tablet:pt-3 max-tablet:pb-4">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <PartTimeStaffForm staff={staff} />
      </div>
    </main>
  );
}
