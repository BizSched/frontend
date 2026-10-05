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
  PartTimeStaffShift,
} from '@lib/types/partTimeStaff';
import {
  formatPartTimeStaffBirthDate,
  formatPartTimeStaffGender,
  formatPartTimeStaffHourlyWage,
} from '@lib/utilities/partTime/partTimeStaff';

interface PartTimeStaffDetailProps {
  staff: PartTimeStaffDetailItem;
  weeklyShifts: PartTimeStaffShift[];
  now: string;
  titleId?: string;
  closeAction?: ReactNode;
  onAttachmentOpen?: (attachment: PartTimeStaffAttachment) => void;
}

function PartTimeStaffDetail({
  staff,
  weeklyShifts,
  now,
  titleId,
  closeAction,
  onAttachmentOpen,
}: PartTimeStaffDetailProps) {
  const { name, phone, birthDate, gender, hourlyWage, attachments, memo } =
    staff;

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
          <PartTimeStaffFieldRow label="나이">
            {formatPartTimeStaffBirthDate(birthDate)}
          </PartTimeStaffFieldRow>
          <PartTimeStaffFieldRow label="성별">
            {formatPartTimeStaffGender(gender)}
          </PartTimeStaffFieldRow>
          <PartTimeStaffFieldRow label="번호">{phone}</PartTimeStaffFieldRow>
          <PartTimeStaffFieldRow label="시급">
            {formatPartTimeStaffHourlyWage(hourlyWage)}
          </PartTimeStaffFieldRow>
        </>
      }
      extra={<PartTimeStaffWeeklySchedule now={now} shifts={weeklyShifts} />}
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
