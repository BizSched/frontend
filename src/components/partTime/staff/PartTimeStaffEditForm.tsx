'use client';

import { useQuery } from '@tanstack/react-query';

import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';

import { staffEditQueryOptions } from '@hooks/api/staff/staffQueryOptions';

import { formatCommonError } from '@lib/api/formatCommonError';

interface PartTimeStaffEditFormProps {
  staffId: number;
}

function PartTimeStaffEditForm({ staffId }: PartTimeStaffEditFormProps) {
  const { data, error, isError, refetch } = useQuery(
    staffEditQueryOptions(staffId),
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {data && <PartTimeStaffForm key={staffId} staff={data} />}
      {isError && (
        <div
          role="alert"
          className="w-full py-10 text-center text-sm text-slate-500"
        >
          <p>{formatCommonError(error)}</p>
          <button
            type="button"
            onClick={() => {
              void refetch();
            }}
            className="mt-2 cursor-pointer underline"
          >
            다시 시도
          </button>
        </div>
      )}
      {!data && !isError && (
        <p
          role="status"
          className="w-full py-10 text-center text-sm text-slate-500"
        >
          상세 정보를 불러오는 중입니다.
        </p>
      )}
    </div>
  );
}

export { PartTimeStaffEditForm };
