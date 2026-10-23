import { EllipsisVerticalIcon } from 'lucide-react';

import { Badge, type BadgeProps } from '@components/_common/Badge/Badge';
import { Card } from '@components/_common/Card/Card';
import { Dropdown } from '@components/_common/Dropdown/Dropdown';
import { PartTimeStaffNoteIcon } from '@components/partTime/staff/PartTimeStaffNoteIcon';

import type {
  PartTimeStaffEmploymentStatus,
  PartTimeStaffListItem,
} from '@lib/types/partTimeStaff';
import { cn } from '@lib/utilities/cn';
import {
  PART_TIME_STAFF_EMPLOYMENT_STATUS_LABELS,
  formatPartTimeStaffCreatedAt,
} from '@lib/utilities/partTime/partTimeStaff';
import { typographyVariants } from '@lib/utilities/typography';

const EMPLOYMENT_STATUS_BADGE_COLORS: Record<
  PartTimeStaffEmploymentStatus,
  BadgeProps['color']
> = {
  employed: 'green',
  onLeave: 'yellow',
  resigned: 'gray',
};

interface PartTimeStaffCardProps {
  staff: PartTimeStaffListItem;
  onDetailOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeletePending?: boolean;
}

function PartTimeStaffCard({
  staff,
  onDetailOpen,
  onEdit,
  onDelete,
  isDeletePending = false,
}: PartTimeStaffCardProps) {
  const { name, phone, createdAt, employmentStatus } = staff;

  return (
    <Card
      radius="lg"
      padding="employee"
      interactive
      className="relative gap-4 max-tablet:gap-3 max-tablet:rounded-[20px] max-tablet:p-4"
    >
      <button
        type="button"
        aria-label={`${name} 상세 보기`}
        onClick={onDetailOpen}
        className="absolute inset-0 cursor-pointer rounded-[inherit] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      />

      <Card.Header className="items-center">
        <div className="flex min-w-0 items-center gap-4 max-tablet:gap-2">
          <PartTimeStaffNoteIcon />
          <div className="flex min-w-0 items-center gap-2">
            <Card.Title className="truncate">{name}</Card.Title>
            <Badge color={EMPLOYMENT_STATUS_BADGE_COLORS[employmentStatus]}>
              {PART_TIME_STAFF_EMPLOYMENT_STATUS_LABELS[employmentStatus]}
            </Badge>
          </div>
        </div>

        <Card.Action>
          <Dropdown
            size="small"
            items={[
              { label: '수정하기', onSelect: onEdit },
              { label: '삭제하기', onSelect: onDelete },
            ]}
          >
            <button
              type="button"
              aria-label={`${name} 더보기`}
              disabled={isDeletePending}
              className="relative flex cursor-pointer items-center justify-center rounded-lg text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <EllipsisVerticalIcon
                className="size-6 max-tablet:size-4"
                aria-hidden="true"
              />
            </button>
          </Dropdown>
        </Card.Action>
      </Card.Header>

      <Card.Content className="flex-row flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              typographyVariants({ role: 'caption' }),
              'shrink-0 rounded-[8px] border border-primary-900 bg-white-50 px-2 py-1 text-primary-900',
            )}
          >
            PHONE
          </span>
          <span
            className={cn(
              typographyVariants({ role: 'body' }),
              'truncate text-slate-500',
            )}
          >
            {phone}
          </span>
        </div>
        <time
          dateTime={createdAt}
          className={cn(
            typographyVariants({ role: 'caption' }),
            'shrink-0 text-slate-300',
          )}
        >
          {formatPartTimeStaffCreatedAt(createdAt)}
        </time>
      </Card.Content>
    </Card>
  );
}

export { PartTimeStaffCard };
export type { PartTimeStaffCardProps };
