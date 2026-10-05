'use client';

import { Dialog } from '@base-ui/react/dialog';
import Image from 'next/image';
import { useId, useState } from 'react';

import { PartTimeStaffAttachmentViewer } from '@components/partTime/staff/PartTimeStaffAttachmentViewer';
import { PartTimeStaffDetail } from '@components/partTime/staff/PartTimeStaffDetail';

import type {
  PartTimeStaffAttachment,
  PartTimeStaffDetailItem,
  PartTimeStaffShift,
} from '@lib/types/partTimeStaff';

import IcDelete from '@assets/icons/ic_delete.svg';

interface PartTimeStaffAttachmentPreview {
  staffId: number;
  attachment: PartTimeStaffAttachment;
}

interface PartTimeStaffDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff?: PartTimeStaffDetailItem;
  weeklyShifts: PartTimeStaffShift[];
  now: string;
}

function PartTimeStaffDetailPanel({
  open,
  onOpenChange,
  staff,
  weeklyShifts,
  now,
}: PartTimeStaffDetailPanelProps) {
  const titleId = useId();
  const [preview, setPreview] = useState<PartTimeStaffAttachmentPreview>();
  const [isViewerCollapsed, setIsViewerCollapsed] = useState(false);

  const previewAttachment =
    staff && preview?.staffId === staff.id ? preview.attachment : undefined;

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
  };

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
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-(--z-modal-base) bg-overlay motion-reduce:animate-none data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <Dialog.Popup
          aria-labelledby={titleId}
          className="fixed inset-y-0 right-0 z-[calc(var(--z-modal-base)+1)] flex max-w-full outline-none motion-reduce:animate-none max-laptop:left-0 max-laptop:flex-col data-open:animate-in data-open:slide-in-from-right max-laptop:data-open:fade-in-0 data-closed:animate-out data-closed:slide-out-to-right max-laptop:data-closed:fade-out-0"
        >
          <div className="min-w-0 overflow-y-auto overscroll-contain rounded-l-modal bg-white-50 px-10 py-12 max-laptop:min-h-0 max-laptop:flex-1 max-laptop:rounded-none max-laptop:px-6 max-laptop:py-10 max-tablet:py-6 laptop:w-200">
            {staff ? (
              <PartTimeStaffDetail
                staff={staff}
                weeklyShifts={weeklyShifts}
                now={now}
                titleId={titleId}
                closeAction={closeButton}
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
          </div>
          {previewAttachment && (
            <PartTimeStaffAttachmentViewer
              attachment={previewAttachment}
              isCollapsed={isViewerCollapsed}
              onCollapsedChange={setIsViewerCollapsed}
            />
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export { PartTimeStaffDetailPanel };
export type { PartTimeStaffDetailPanelProps };
