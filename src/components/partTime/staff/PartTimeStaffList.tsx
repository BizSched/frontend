'use client';

import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { Pagination } from '@components/_common/Pagination/Pagination';
import { PartTimeStaffCard } from '@components/partTime/staff/PartTimeStaffCard';
import { PartTimeStaffDetailPanel } from '@components/partTime/staff/PartTimeStaffDetailPanel';
import {
  PART_TIME_STAFF_LIST_MOCKS,
  getPartTimeStaffDetailMock,
  getPartTimeStaffWeeklyShiftMocks,
} from '@components/partTime/staff/partTimeStaffMock';

import { usePageSearchParam } from '@hooks/pagination/usePageSearchParam';

import IcEmpty from '@assets/icons/ic_empty.svg';

const PAGE_SIZE = 10;
const PAGE_PARAM = 'page';
const STAFF_ID_PARAM = 'staffId';

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

  const totalPages = Math.max(
    1,
    Math.ceil(PART_TIME_STAFF_LIST_MOCKS.length / PAGE_SIZE),
  );
  const page = Math.min(currentPage, totalPages);
  const staffs = PART_TIME_STAFF_LIST_MOCKS.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const staffIdParam = searchParams.get(STAFF_ID_PARAM);
  const staff =
    staffIdParam === null
      ? undefined
      : getPartTimeStaffDetailMock(Number(staffIdParam));
  const isStaffNotFound = staffIdParam !== null && !staff;
  const isPageOver = currentPage > totalPages;

  const [displayedStaff, setDisplayedStaff] = useState(staff);

  if (staff && staff.id !== displayedStaff?.id) {
    setDisplayedStaff(staff);
  }

  useEffect(() => {
    if (!isStaffNotFound && !isPageOver) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (isStaffNotFound) {
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

  const handleDelete = () => {
    void openConfirmModal({
      title: '아르바이트생을 삭제하시겠어요?',
      description: '삭제된 상세 내용은 복구할 수 없습니다.',
      confirmText: '삭제',
    });
  };

  if (staffs.length === 0) {
    return (
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
    );
  }

  return (
    <div className="flex flex-col gap-5 max-mobile:gap-4">
      <ul className="grid grid-cols-2 gap-x-6 gap-y-5 max-laptop:grid-cols-1 max-laptop:gap-y-4">
        {staffs.map((listStaff) => (
          <li key={listStaff.id} className="min-w-0">
            <PartTimeStaffCard
              staff={listStaff}
              onDetailOpen={() => handleDetailOpen(listStaff.id)}
              onEdit={() => router.push(`/partTime/staff/${listStaff.id}/edit`)}
              onDelete={handleDelete}
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
      <PartTimeStaffDetailPanel
        open={Boolean(staff)}
        onOpenChange={handleDetailOpenChange}
        staff={displayedStaff}
        weeklyShifts={
          displayedStaff
            ? getPartTimeStaffWeeklyShiftMocks(displayedStaff.id, now)
            : []
        }
        now={now}
      />
    </div>
  );
}

export { PartTimeStaffList };
