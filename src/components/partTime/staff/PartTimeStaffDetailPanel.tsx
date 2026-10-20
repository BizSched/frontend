'use client';

import { Dialog } from '@base-ui/react/dialog';
import Image from 'next/image';
import { type CSSProperties, useId, useMemo, useState } from 'react';

import { FormDropdown } from '@components/_common/FormDropdown/FormDropdown';
import { PartTimeStaffAttachmentViewer } from '@components/partTime/staff/PartTimeStaffAttachmentViewer';
import { PartTimeStaffDetail } from '@components/partTime/staff/PartTimeStaffDetail';

import { formatCommonError } from '@lib/api/formatCommonError';
import type {
  PartTimeStaffAttachment,
  PartTimeStaffDetailItem,
  PartTimeStaffEmploymentStatus,
  PartTimeStaffListItem,
  PartTimeStaffShift,
} from '@lib/types/partTimeStaff';
import { cn } from '@lib/utilities/cn';
import {
  PART_TIME_STAFF_EMPLOYMENT_STATUS_LABELS,
  PART_TIME_STAFF_EMPLOYMENT_STATUSES,
} from '@lib/utilities/partTime/partTimeStaff';

import IcDelete from '@assets/icons/ic_delete.svg';

const EMPLOYMENT_STATUS_OPTIONS = PART_TIME_STAFF_EMPLOYMENT_STATUSES.map(
  (employmentStatus) => ({
    value: employmentStatus,
    label: PART_TIME_STAFF_EMPLOYMENT_STATUS_LABELS[employmentStatus],
  }),
);

interface PartTimeStaffAttachmentPreview {
  staffId: number;
  attachment: PartTimeStaffAttachment;
}

interface PartTimeStaffDetailPanelProps {
  open: boolean;
  stackIndex?: number;
  isObscured?: boolean;
  onExitComplete?: () => void;
  onOpenChange: (open: boolean) => void;
  staff?: PartTimeStaffDetailItem;
  listStaff?: PartTimeStaffListItem;
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  weeklyShifts: PartTimeStaffShift[];
  isWeeklyShiftsLoading?: boolean;
  weeklyShiftsError?: unknown;
  onWeeklyShiftsRetry?: () => void;
  now: string;
  onEmploymentStatusChange?: (
    staffId: number,
    employmentStatus: PartTimeStaffEmploymentStatus,
  ) => void;
  isEmploymentStatusLocked?: boolean;
  isEmploymentStatusPending?: boolean;
}

function PartTimeStaffDetailPanel({
  open,
  stackIndex = 0,
  isObscured = false,
  onExitComplete,
  onOpenChange,
  staff,
  listStaff,
  isLoading,
  error,
  onRetry,
  weeklyShifts,
  isWeeklyShiftsLoading,
  weeklyShiftsError,
  onWeeklyShiftsRetry,
  now,
  onEmploymentStatusChange,
  isEmploymentStatusLocked = false,
  isEmploymentStatusPending = false,
}: PartTimeStaffDetailPanelProps) {
  const titleId = useId();
  const [preview, setPreview] = useState<PartTimeStaffAttachmentPreview>();
  const [isViewerCollapsed, setIsViewerCollapsed] = useState(false);
  const currentSnapshot = useMemo(
    () => ({
      staff,
      listStaff,
      isLoading,
      error,
      weeklyShifts,
      isWeeklyShiftsLoading,
      weeklyShiftsError,
      now,
    }),
    [
      staff,
      listStaff,
      isLoading,
      error,
      weeklyShifts,
      isWeeklyShiftsLoading,
      weeklyShiftsError,
      now,
    ],
  );
  const [lastSnapshot, setLastSnapshot] = useState<typeof currentSnapshot>();
  if (open && lastSnapshot !== currentSnapshot) {
    setLastSnapshot(currentSnapshot);
  }
  const displayed = open ? currentSnapshot : lastSnapshot;
  const displayedStaff = displayed?.staff;
  const profile = displayedStaff ?? displayed?.listStaff;

  const previewAttachment =
    displayedStaff && preview?.staffId === displayedStaff.id
      ? preview.attachment
      : undefined;

  const handleAttachmentOpen = (attachment: PartTimeStaffAttachment) => {
    if (!staff) {
      return;
    }

    setPreview({ staffId: staff.id, attachment });
    setIsViewerCollapsed(false);
  };

  const handleOpenChangeComplete = (isOpen: boolean) => {
    if (isOpen) {
      return;
    }

    setPreview(undefined);
    setIsViewerCollapsed(false);
    setLastSnapshot(undefined);
    onExitComplete?.();
  };

  const statusAction = profile && onEmploymentStatusChange && (
    <div role="group" aria-label="재직 상태">
      <FormDropdown
        size="small"
        value={profile.employmentStatus}
        options={EMPLOYMENT_STATUS_OPTIONS}
        disabled={!open || isEmploymentStatusLocked}
        onChange={(value) => {
          const employmentStatus = PART_TIME_STAFF_EMPLOYMENT_STATUSES.find(
            (status) => status === value,
          );
          if (employmentStatus && employmentStatus !== profile.employmentStatus)
            onEmploymentStatusChange(profile.id, employmentStatus);
        }}
      />
    </div>
  );

  const headerNotice = isEmploymentStatusPending ? (
    <p role="status" className="text-sm text-slate-500">
      재직 상태를 바꾸는 중입니다.
    </p>
  ) : null;

  const closeButton = (
    <Dialog.Close
      aria-label="닫기"
      className="flex size-6 cursor-pointer items-center justify-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Image src={IcDelete} alt="" width={13.8} height={13.8} unoptimized />
    </Dialog.Close>
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
    >
      <Dialog.Portal
        style={{ '--modal-stack-index': stackIndex } as CSSProperties}
      >
        <Dialog.Backdrop
          className={cn(
            'fixed inset-0 z-[calc(var(--z-modal-base)+var(--modal-stack-index)*10)] motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
            stackIndex === 0 && 'bg-overlay',
          )}
        />
        <Dialog.Popup
          aria-labelledby={titleId}
          className="fixed inset-y-0 right-0 z-[calc(var(--z-modal-base)+var(--modal-stack-index)*10+1)] flex max-w-full outline-none motion-reduce:animate-none max-laptop:left-0 max-laptop:flex-col data-open:animate-in data-open:slide-in-from-right max-laptop:data-open:fade-in-0 data-closed:animate-out data-closed:slide-out-to-right max-laptop:data-closed:fade-out-0"
        >
          <div className="min-w-0 overflow-y-auto overscroll-contain rounded-l-modal bg-white-50 px-10 py-12 max-laptop:min-h-0 max-laptop:flex-1 max-laptop:rounded-none max-laptop:px-6 max-laptop:py-10 max-tablet:py-6 laptop:w-200">
            {profile ? (
              <PartTimeStaffDetail
                staff={profile}
                detail={displayedStaff}
                isLoading={displayed?.isLoading}
                isError={Boolean(displayed?.error)}
                weeklyShifts={displayed?.weeklyShifts ?? []}
                isWeeklyShiftsLoading={displayed?.isWeeklyShiftsLoading}
                weeklyShiftsError={displayed?.weeklyShiftsError}
                onWeeklyShiftsRetry={onWeeklyShiftsRetry}
                now={displayed?.now ?? now}
                titleId={titleId}
                closeAction={closeButton}
                statusAction={statusAction}
                headerNotice={headerNotice}
                onAttachmentOpen={handleAttachmentOpen}
              />
            ) : (
              <div className="flex justify-end">
                <h2 id={titleId} className="sr-only">
                  아르바이트생 상세
                </h2>
                {closeButton}
              </div>
            )}
            {displayed?.error ? (
              <div
                role="alert"
                className="py-6 text-center text-sm text-slate-500"
              >
                <p>{formatCommonError(displayed.error)}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-2 cursor-pointer underline"
                >
                  다시 시도
                </button>
              </div>
            ) : displayed?.isLoading ? (
              <p
                role="status"
                className="py-6 text-center text-sm text-slate-500"
              >
                상세 정보를 불러오는 중입니다.
              </p>
            ) : null}
          </div>
          {previewAttachment && (
            <PartTimeStaffAttachmentViewer
              attachment={previewAttachment}
              isCollapsed={isViewerCollapsed}
              onCollapsedChange={setIsViewerCollapsed}
            />
          )}
          {isObscured && (
            <div
              aria-hidden="true"
              className="absolute inset-0 z-1 rounded-l-modal bg-overlay max-laptop:rounded-none"
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { PartTimeStaffDetailPanel };
export type { PartTimeStaffDetailPanelProps };
