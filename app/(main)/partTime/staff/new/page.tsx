import type { Metadata } from 'next';

import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';

export const metadata: Metadata = {
  title: '아르바이트생 등록하기',
};

export default function PartTimeStaffNewPage() {
  return (
    <main className="flex flex-1 bg-[#f2f2f2]">
      <PartTimeStaffForm />
    </main>
  );
}
