import type { ReactNode } from 'react';

import { PartTimeStaffAttachmentBox } from '@components/partTime/staff/PartTimeStaffAttachmentBox';
import { PartTimeStaffAttachmentFile } from '@components/partTime/staff/PartTimeStaffAttachmentFile';
import { PartTimeStaffFieldRow } from '@components/partTime/staff/PartTimeStaffFieldRow';
import { PartTimeStaffNoteIcon } from '@components/partTime/staff/PartTimeStaffNoteIcon';
import { PartTimeStaffProfileLayout } from '@components/partTime/staff/PartTimeStaffProfileLayout';
import { PartTimeStaffWeeklySchedule } from '@components/partTime/staff/PartTimeStaffWeeklySchedule';

import type {
  PartTimeStaffAttachment,
  PartTimeStaffDetailItem,
  PartTimeStaffListItem,
  PartTimeStaffShift,
} from '@lib/types/partTimeStaff';
import {
  formatPartTimeStaffBirthDate,
  formatPartTimeStaffGender,
  formatPartTimeStaffHourlyWage,
} from '@lib/utilities/partTime/partTimeStaff';

interface PartTimeStaffDetailProps {
  staff: PartTimeStaffListItem;
  detail?: PartTimeStaffDetailItem;
  isLoading?: boolean;
  isError?: boolean;
  weeklyShifts: PartTimeStaffShift[];
  isWeeklyShiftsLoading?: boolean;
  weeklyShiftsError?: unknown;
  onWeeklyShiftsRetry?: () => void;
  now: string;
  titleId?: string;
  closeAction?: ReactNode;
  onAttachmentOpen?: (attachment: PartTimeStaffAttachment) => void;
}

function PartTimeStaffDetail({
  staff,
  detail,
  isLoading,
  isError,
  weeklyShifts,
  isWeeklyShiftsLoading,
  weeklyShiftsError,
  onWeeklyShiftsRetry,
  now,
  titleId,
  closeAction,
  onAttachmentOpen,
}: PartTimeStaffDetailProps) {
  const { name, phone } = staff;
  const {
    birthDate,
    gender,
    hourlyWage,
    attachments = [],
    memo,
  } = detail ?? {};
  const pendingValue = isError ? (
    '조회 실패'
  ) : isLoading ? (
    <span aria-hidden className="inline-block h-4 w-20 rounded bg-slate-100" />
  ) : (
    '조회 전'
  );

  return (
    <PartTimeStaffProfileLayout
      title={
        <div className="flex items-center gap-3 max-tablet:flex-col-reverse max-tablet:items-stretch max-tablet:gap-0">
          <div className="flex min-w-0 flex-1 items-center gap-3 max-tablet:gap-2">
            <PartTimeStaffNoteIcon />
            <h2
              id={titleId}
              className="min-w-0 flex-1 text-2xl leading-8 font-semibold tracking-[-0.03em] wrap-break-word text-slate-800 max-tablet:text-lg max-tablet:leading-7"
            >
              {name}
            </h2>
          </div>
          {closeAction && (
            <div className="flex shrink-0 max-tablet:self-end">
              {closeAction}
            </div>
          )}
        </div>
      }
      fields={
        <>
          <PartTimeStaffFieldRow label="생년월일">
            {detail ? formatPartTimeStaffBirthDate(birthDate) : pendingValue}
          </PartTimeStaffFieldRow>
          <PartTimeStaffFieldRow label="성별">
            {detail ? formatPartTimeStaffGender(gender) : pendingValue}
          </PartTimeStaffFieldRow>
          <PartTimeStaffFieldRow label="번호">
            {phone || '-'}
          </PartTimeStaffFieldRow>
          <PartTimeStaffFieldRow label="시급">
            {detail ? formatPartTimeStaffHourlyWage(hourlyWage) : pendingValue}
          </PartTimeStaffFieldRow>
        </>
      }
      extra={
        <PartTimeStaffWeeklySchedule
          now={now}
          shifts={weeklyShifts}
          isLoading={isWeeklyShiftsLoading}
          error={weeklyShiftsError}
          onRetry={onWeeklyShiftsRetry}
        />
      }
      attachments={
        attachments.length > 0 && (
          <PartTimeStaffAttachmentBox>
            {attachments.map((attachment) => (
              <li key={attachment.id} className="flex">
                <button
                  type="button"
                  aria-label={`${attachment.name} 열기`}
                  onClick={() => onAttachmentOpen?.(attachment)}
                  className="flex min-w-0 cursor-pointer rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <PartTimeStaffAttachmentFile name={attachment.name} />
                </button>
              </li>
            ))}
          </PartTimeStaffAttachmentBox>
        )
      }
      body={
        memo && (
          <p className="text-sm leading-5 tracking-[-0.03em] wrap-break-word whitespace-pre-wrap text-[#333333]">
            {memo}
          </p>
        )
      }
    />
  );
}

export { PartTimeStaffDetail };
export type { PartTimeStaffDetailProps };
