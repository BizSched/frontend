'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { match, P } from 'ts-pattern';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { Pagination } from '@components/_common/Pagination/Pagination';
import { PartTimeStaffCard } from '@components/partTime/staff/PartTimeStaffCard';
import { PartTimeStaffDetailOverlay } from '@components/partTime/staff/PartTimeStaffDetailOverlay';

import { STAFF_LIST_PAGE_SIZE } from '@hooks/api/staff/staffQueryOptions';
import { useChangeStaffEmploymentStatus } from '@hooks/api/staff/useChangeStaffEmploymentStatus';
import { useDeleteStaff } from '@hooks/api/staff/useDeleteStaff';
import { useStaffDetail } from '@hooks/api/staff/useStaffDetail';
import { useStaffList } from '@hooks/api/staff/useStaffList';
import { useStaffWeeklyShifts } from '@hooks/api/staff/useStaffWeeklyShifts';
import { usePageSearchParam } from '@hooks/pagination/usePageSearchParam';

import { ApiError } from '@lib/api/apiError';
import { formatCommonError } from '@lib/api/formatCommonError';
import type {
  PartTimeStaffEmploymentStatus,
  PartTimeStaffShift,
} from '@lib/types/partTimeStaff';

import IcEmpty from '@assets/icons/ic_empty.svg';

const PAGE_PARAM = 'page';
const STAFF_ID_PARAM = 'staffId';
const NO_WEEKLY_SHIFTS: PartTimeStaffShift[] = [];

const isStaffNotFoundError = (error: unknown) =>
  match(error)
    .with(
      P.instanceOf(ApiError),
      ({ errorCode }) => errorCode === 'STAFF_NOT_FOUND',
    )
    .otherwise(() => false);

const createUrl = (pathname: string, searchParams: URLSearchParams) => {
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
};

interface PartTimeStaffListProps {
  now: string;
}

function PartTimeStaffList({ now }: PartTimeStaffListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentPage, setCurrentPage } = usePageSearchParam(PAGE_PARAM);
  const hasPushedDetailRef = useRef(false);
  const isDeletePendingRef = useRef(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const deleteMutation = useDeleteStaff();
  const isDeletePending = isDeleteConfirmOpen || deleteMutation.isPending;
  const isDeleteStaffNotFound = isStaffNotFoundError(deleteMutation.error);
  const isStatusChangeLockedRef = useRef(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const statusMutation = useChangeStaffEmploymentStatus();
  const isStatusStaffNotFound = isStaffNotFoundError(statusMutation.error);

  const listQuery = useStaffList({
    page: currentPage,
    size: STAFF_LIST_PAGE_SIZE,
  });
  const totalPages = Math.max(1, listQuery.data?.totalPage ?? currentPage);
  const page = Math.min(currentPage, totalPages);
  const correctedListQuery = useStaffList({ page, size: STAFF_LIST_PAGE_SIZE });
  const activeListQuery = page === currentPage ? listQuery : correctedListQuery;
  const staffs = activeListQuery.data?.items ?? [];

  const staffIdParam = searchParams.get(STAFF_ID_PARAM);
  const staffId =
    staffIdParam && /^\d+$/.test(staffIdParam) ? Number(staffIdParam) : 0;
  const hasValidStaffId = Number.isSafeInteger(staffId) && staffId > 0;
  const detailQuery = useStaffDetail(staffId);
  const weeklyShiftsQuery = useStaffWeeklyShifts(staffId, now);
  const isStaffNotFound =
    staffIdParam !== null &&
    (!hasValidStaffId ||
      (deleteMutation.isSuccess && deleteMutation.data === staffId) ||
      (isDeleteStaffNotFound && deleteMutation.variables === staffId) ||
      (isStatusStaffNotFound &&
        statusMutation.variables?.staffId === staffId) ||
      match(detailQuery.error)
        .with(P.instanceOf(ApiError), ({ status }) => status === 404)
        .otherwise(() => false));
  const isPageOver = Boolean(listQuery.data) && currentPage > totalPages;
  const listStaff = staffs.find(({ id }) => id === staffId);

  useEffect(() => {
    if (!isStaffNotFound && !isPageOver) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (isStaffNotFound) {
      hasPushedDetailRef.current = false;
      nextSearchParams.delete(STAFF_ID_PARAM);
    }

    if (isPageOver) {
      if (totalPages <= 1) {
        nextSearchParams.delete(PAGE_PARAM);
      } else {
        nextSearchParams.set(PAGE_PARAM, String(totalPages));
      }
    }

    window.history.replaceState(
      null,
      '',
      createUrl(pathname, nextSearchParams),
    );
  }, [isPageOver, isStaffNotFound, pathname, searchParams, totalPages]);

  const handleDetailOpen = (staffId: number) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.set(STAFF_ID_PARAM, String(staffId));
    if (!isStatusChangeLockedRef.current) statusMutation.reset();
    hasPushedDetailRef.current = true;
    window.history.pushState(null, '', createUrl(pathname, nextSearchParams));
  };

  const handleDetailOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      return;
    }

    if (hasPushedDetailRef.current) {
      hasPushedDetailRef.current = false;
      router.back();
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.delete(STAFF_ID_PARAM);
    window.history.replaceState(
      null,
      '',
      createUrl(pathname, nextSearchParams),
    );
  };

  const handleDelete = async (staffId: number) => {
    if (isDeletePendingRef.current) return;
    isDeletePendingRef.current = true;
    setIsDeleteConfirmOpen(true);
    deleteMutation.reset();

    try {
      const isConfirmed = await openConfirmModal({
        title: '아르바이트생을 삭제하시겠어요?',
        description:
          '아직 오지 않은 근무 스케쥴도 함께 삭제돼요. 삭제된 상세 내용과 스케쥴은 복구할 수 없습니다.',
        confirmText: '삭제',
      });

      if (isConfirmed) await deleteMutation.mutateAsync(staffId);
    } catch {
      // NOTE: 삭제 오류는 목록 위에 인라인으로 표시한다
    } finally {
      setIsDeleteConfirmOpen(false);
      isDeletePendingRef.current = false;
    }
  };

  const handleEmploymentStatusChange = async (
    staffId: number,
    employmentStatus: PartTimeStaffEmploymentStatus,
  ) => {
    if (isStatusChangeLockedRef.current) return;
    isStatusChangeLockedRef.current = true;
    statusMutation.reset();

    try {
      if (employmentStatus !== 'employed') {
        setIsStatusConfirmOpen(true);
        const isConfirmed = await openConfirmModal({
          title: '재직 상태를 바꾸시겠어요?',
          description:
            '아직 오지 않은 근무 스케쥴이 삭제돼요. 다시 재직으로 바꿔도 복구되지 않아요.',
          confirmText: '변경',
        });
        setIsStatusConfirmOpen(false);
        if (!isConfirmed) return;
      }

      await statusMutation.mutateAsync({ staffId, employmentStatus });
    } catch {
      // NOTE: 재직 상태 변경 오류는 상세 헤더 아래에 인라인으로 표시한다
    } finally {
      setIsStatusConfirmOpen(false);
      isStatusChangeLockedRef.current = false;
    }
  };

  const listContent = activeListQuery.isError ? (
    <div role="alert" className="py-10 text-center text-sm text-slate-500">
      <p>{formatCommonError(activeListQuery.error)}</p>
      <button
        type="button"
        onClick={() => {
          void activeListQuery.refetch();
        }}
        className="mt-2 cursor-pointer underline"
      >
        다시 시도
      </button>
    </div>
  ) : !activeListQuery.data ? (
    <p role="status" className="py-10 text-center text-sm text-slate-500">
      아르바이트생 목록을 불러오는 중입니다.
    </p>
  ) : staffs.length === 0 && activeListQuery.data.totalCount > 0 ? (
    <p role="status" className="py-10 text-center text-sm text-slate-500">
      아르바이트생 목록을 갱신하는 중입니다.
    </p>
  ) : staffs.length === 0 ? (
    <div className="flex flex-1 flex-col items-center justify-center gap-4.5 py-10 max-tablet:gap-2.5">
      <Image
        src={IcEmpty}
        alt=""
        width={130}
        height={140}
        unoptimized
        className="max-tablet:h-21.25 max-tablet:w-19.75"
      />
      <p className="text-base leading-6 font-medium tracking-[-0.03em] text-[#737373] max-tablet:text-sm max-tablet:leading-5">
        등록된 아르바이트생이 없어요.
      </p>
    </div>
  ) : (
    <>
      <ul className="grid grid-cols-2 gap-x-6 gap-y-5 max-laptop:grid-cols-1 max-laptop:gap-y-4">
        {staffs.map((listStaff) => (
          <li key={listStaff.id} className="min-w-0">
            <PartTimeStaffCard
              staff={listStaff}
              onDetailOpen={() => handleDetailOpen(listStaff.id)}
              onEdit={() => router.push(`/partTime/staff/${listStaff.id}/edit`)}
              onDelete={() => {
                void handleDelete(listStaff.id);
              }}
              isDeletePending={isDeletePending}
            />
          </li>
        ))}
      </ul>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        label="아르바이트생 목록 페이지"
      />
    </>
  );

  return (
    <div className="flex flex-1 flex-col gap-5 max-mobile:gap-4">
      {deleteMutation.error && (
        <div role="alert" className="text-sm text-warning-500">
          <p>{formatCommonError(deleteMutation.error)}</p>
          {isDeleteStaffNotFound && (
            <button
              type="button"
              disabled={activeListQuery.isFetching}
              onClick={() => {
                deleteMutation.reset();
                void activeListQuery.refetch({ cancelRefetch: false });
              }}
              className="mt-2 cursor-pointer underline disabled:cursor-not-allowed disabled:opacity-50"
            >
              목록 새로고침
            </button>
          )}
        </div>
      )}
      {isStatusStaffNotFound && (
        <p role="alert" className="text-sm text-warning-500">
          {formatCommonError(statusMutation.error)}
        </p>
      )}
      {deleteMutation.isPending && (
        <p role="status" className="text-sm text-slate-500">
          아르바이트생을 삭제하는 중입니다.
        </p>
      )}
      {!deleteMutation.isPending &&
        activeListQuery.isFetching &&
        staffs.length > 0 && (
          <p role="status" className="text-sm text-slate-500">
            아르바이트생 목록을 갱신하는 중입니다.
          </p>
        )}
      {listContent}
      <PartTimeStaffDetailOverlay
        open={staffIdParam !== null && !isStaffNotFound}
        onOpenChange={handleDetailOpenChange}
        staff={detailQuery.data}
        listStaff={listStaff}
        isLoading={hasValidStaffId && !detailQuery.data && !detailQuery.isError}
        error={detailQuery.error}
        onRetry={() => {
          void detailQuery.refetch();
        }}
        weeklyShifts={weeklyShiftsQuery.data ?? NO_WEEKLY_SHIFTS}
        isWeeklyShiftsLoading={
          hasValidStaffId &&
          !weeklyShiftsQuery.data &&
          !weeklyShiftsQuery.isError
        }
        weeklyShiftsError={weeklyShiftsQuery.error}
        onWeeklyShiftsRetry={() => {
          void weeklyShiftsQuery.refetch();
        }}
        now={now}
        onEmploymentStatusChange={(staffId, employmentStatus) => {
          void handleEmploymentStatusChange(staffId, employmentStatus);
        }}
        isEmploymentStatusLocked={
          isStatusConfirmOpen || statusMutation.isPending
        }
        isEmploymentStatusPending={
          statusMutation.isPending &&
          statusMutation.variables.staffId === staffId
        }
        employmentStatusError={
          statusMutation.variables?.staffId === staffId &&
          !isStatusStaffNotFound
            ? statusMutation.error
            : undefined
        }
      />
    </div>
  );
}

export { PartTimeStaffList };
