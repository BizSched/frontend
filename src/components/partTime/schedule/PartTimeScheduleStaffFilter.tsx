import Image from 'next/image';

import { Dropdown } from '@components/_common/Dropdown/Dropdown';

import type { PartTimeStaff } from '@lib/types/partTimeSchedule';

import IcChevronDown from '@assets/icons/ic_chevron-down.svg';
import ImgGoal from '@assets/icons/img_goal.svg';

const ALL_STAFF_LABEL = '아르바이트생 전체 스케쥴';

interface PartTimeScheduleStaffFilterProps {
  staffs: PartTimeStaff[];
  selectedStaffId: number | null;
  onStaffChange: (staffId: number | null) => void;
}

function PartTimeScheduleStaffFilter({
  staffs,
  selectedStaffId,
  onStaffChange,
}: PartTimeScheduleStaffFilterProps) {
  const selectedStaff = staffs.find((staff) => staff.id === selectedStaffId);

  const items = [
    {
      label: ALL_STAFF_LABEL,
      isSelected: selectedStaffId === null,
      onSelect: () => onStaffChange(null),
    },
    ...staffs.map((staff) => ({
      label: staff.name,
      isSelected: staff.id === selectedStaffId,
      onSelect: () => onStaffChange(staff.id),
    })),
  ];

  return (
    <Dropdown
      items={items}
      sideOffset={6}
      className="max-h-80 w-(--anchor-width) overflow-y-auto"
    >
      <button
        type="button"
        aria-label={`스케쥴 필터: ${selectedStaff?.name ?? ALL_STAFF_LABEL}`}
        className="group flex w-87.5 cursor-pointer items-center justify-between gap-2 rounded-2xl border border-[#f2f2f2] bg-[#fafafa] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-slate-500 max-tablet:w-full"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#ffe5b7]">
            <Image src={ImgGoal} alt="" width={18} height={17.78} unoptimized />
          </span>
          <span className="truncate text-sm font-semibold tracking-[-0.03em] text-[#333333]">
            {selectedStaff?.name ?? ALL_STAFF_LABEL}
          </span>
        </span>
        <Image
          src={IcChevronDown}
          alt=""
          width={24}
          height={24}
          unoptimized
          className="transition-transform group-data-popup-open:rotate-180"
        />
      </button>
    </Dropdown>
  );
}

export { PartTimeScheduleStaffFilter };
