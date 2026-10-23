import Image from 'next/image';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import { cn } from '@lib/utilities/cn';
import { formatPartTimeScheduleDuration } from '@lib/utilities/partTime/partTimeSchedule';
import { typographyVariants } from '@lib/utilities/typography';

import IcNote from '@assets/icons/ic_note.svg';

interface WorkerCardProps {
  schedule: PartTimeSchedule;
}

function WorkerCard({ schedule }: WorkerCardProps) {
  const { staff, startTime, endTime } = schedule;

  return (
    <div className="flex items-center gap-2.5 rounded-full bg-white-50 px-3 py-2 shadow-md">
      <span className="relative size-8 shrink-0 overflow-hidden rounded-[8px] bg-[#c7f2eb] max-mobile:hidden">
        <Image
          src={IcNote}
          alt=""
          width={14}
          height={17.8889}
          className="absolute top-[7px] left-[9px] max-mobile:hidden"
          unoptimized
        />
      </span>

      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            typographyVariants({ role: 'subtitle' }),
            'text-slate-500',
          )}
        >
          {staff.name}
        </span>
        <span
          className={cn(
            typographyVariants({ role: 'supporting' }),
            'text-slate-400',
          )}
        >
          {startTime} - {endTime} (
          {formatPartTimeScheduleDuration(startTime, endTime)})
        </span>
      </div>
    </div>
  );
}

export { WorkerCard };
export type { WorkerCardProps };
