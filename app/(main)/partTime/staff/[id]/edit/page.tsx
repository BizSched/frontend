import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { match, P } from 'ts-pattern';

import { PartTimeStaffEditForm } from '@components/partTime/staff/PartTimeStaffEditForm';

import { staffDetailQueryOptions } from '@hooks/api/staff/staffQueryOptions';

import { getServerQueryClient } from '@providers/query/getServerQueryClient';

import { ApiError } from '@lib/api/apiError';
import { getAuthHeaders } from '@lib/api/getAuthHeaders';

export const metadata: Metadata = {
  title: '아르바이트생 정보 수정하기',
};

const STAFF_ID_PATTERN = /^\d+$/;

export default async function PartTimeStaffEditPage({
  params,
  searchParams,
}: PageProps<'/partTime/staff/[id]/edit'>) {
  const { id } = await params;
  const { uploadFailed } = await searchParams;
  const staffId = Number(id);
  if (
    !STAFF_ID_PATTERN.test(id) ||
    !Number.isSafeInteger(staffId) ||
    staffId <= 0
  ) {
    notFound();
  }
  const queryClient = getServerQueryClient();
  try {
    await queryClient.fetchQuery(
      staffDetailQueryOptions(staffId, { headers: await getAuthHeaders() }),
    );
  } catch (error) {
    const isNotFound = match(error)
      .with(P.instanceOf(ApiError), ({ status }) => status === 404)
      .otherwise(() => false);
    if (isNotFound) notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="flex flex-1 bg-[#f2f2f2]">
        <PartTimeStaffEditForm
          staffId={staffId}
          hasIncompleteUpload={uploadFailed === '1'}
        />
      </main>
    </HydrationBoundary>
  );
}
