import Image from 'next/image';

import IcNote from '@assets/icons/ic_note.svg';

import type { WorkerShift } from './TodayWorkerSection';

interface WorkerCardProps {
  worker: WorkerShift;
}

function WorkerCard({ worker }: WorkerCardProps) {
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
        <span className="text-sm font-semibold text-slate-500">
          {worker.name}
        </span>
        <span className="text-xs text-slate-300">
          {worker.startTime} - {worker.endTime} ({worker.duration})
        </span>
      </div>
    </div>
  );
}

export { WorkerCard };
export type { WorkerCardProps };
