'use client';

import { useQuery } from '@tanstack/react-query';

import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';

import { staffEditQueryOptions } from '@hooks/api/staff/staffQueryOptions';

import { formatCommonError } from '@lib/api/formatCommonError';

interface PartTimeStaffEditFormProps {
  staffId: number;
  hasIncompleteUpload?: boolean;
}

function PartTimeStaffEditForm({
  staffId,
  hasIncompleteUpload = false,
}: PartTimeStaffEditFormProps) {
  const { data, error, isError, refetch } = useQuery(
    staffEditQueryOptions(staffId),
  );
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      {hasIncompleteUpload && (
        <p role="alert" className="px-6 pt-6 text-sm text-slate-500">
          등록 정보는 저장됐지만 첨부파일 업로드를 완료하지 못했어요. 저장된
          파일을 확인하고 빠진 파일을 다시 첨부해주세요.
        </p>
      )}
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
