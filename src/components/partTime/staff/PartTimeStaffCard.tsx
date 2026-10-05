import { EllipsisVerticalIcon } from 'lucide-react';

import { Card } from '@components/_common/Card/Card';
import { Dropdown } from '@components/_common/Dropdown/Dropdown';
import { PartTimeStaffNoteIcon } from '@components/partTime/staff/PartTimeStaffNoteIcon';

import type { PartTimeStaffListItem } from '@lib/types/partTimeStaff';
import { formatPartTimeStaffCreatedAt } from '@lib/utilities/partTime/partTimeStaff';

interface PartTimeStaffCardProps {
  staff: PartTimeStaffListItem;
  onDetailOpen?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function PartTimeStaffCard({
  staff,
  onDetailOpen,
  onEdit,
  onDelete,
}: PartTimeStaffCardProps) {
  const { name, phone, createdAt } = staff;

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
          <Card.Title className="truncate max-tablet:text-sm max-tablet:leading-5">
            {name}
          </Card.Title>
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
              className="relative flex cursor-pointer items-center justify-center rounded-lg text-[#a4a4a4] outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <EllipsisVerticalIcon
                className="size-6 max-tablet:size-4"
                aria-hidden="true"
              />
            </button>
          </Dropdown>
        </Card.Action>
      </Card.Header>

      <Card.Content className="flex-row items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 rounded-[8px] border border-primary-900 bg-white-50 px-2 py-1 text-xs leading-4 font-semibold text-primary-900">
            PHONE
          </span>
          <span className="truncate text-sm leading-5 tracking-[-0.03em] text-[#333333] max-tablet:text-xs max-tablet:leading-4 max-tablet:tracking-normal">
            {phone}
          </span>
        </div>
        <time
          dateTime={createdAt}
          className="shrink-0 text-xs leading-4 text-[#a4a4a4]"
        >
          {formatPartTimeStaffCreatedAt(createdAt)}
        </time>
      </Card.Content>
    </Card>
  );
}

export { PartTimeStaffCard };
export type { PartTimeStaffCardProps };
