import { Checkbox } from '@components/_common/Checkbox/Checkbox';
import { TextButton } from '@components/_common/TextButton/TextButton';

import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import { cn } from '@lib/utilities/cn';
import { formatPartTimeScheduleSummaryTitle } from '@lib/utilities/partTime/partTimeSchedule';

interface PartTimeScheduleDaySummaryProps {
  date: string;
  today: string;
  schedules: PartTimeSchedule[];
  onScheduleEdit: (schedule: PartTimeSchedule) => void;
  onScheduleDelete: (schedule: PartTimeSchedule) => void;
  className?: string;
}

function PartTimeScheduleDaySummary({
  date,
  today,
  schedules,
  onScheduleEdit,
  onScheduleDelete,
  className,
}: PartTimeScheduleDaySummaryProps) {
  const titleId = `part-time-schedule-summary-${date}`;
  const checkedInCount = schedules.filter(
    (schedule) => schedule.isCheckedIn,
  ).length;
  const hasSchedules = schedules.length > 0;
  const progressPercent = hasSchedules
    ? (checkedInCount / schedules.length) * 100
    : 0;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'flex flex-col gap-5 rounded-2xl bg-white-50 p-5',
        className,
      )}
    >
      <div
        aria-live="polite"
        className="flex items-end justify-between gap-2 whitespace-nowrap"
      >
        <h2
          id={titleId}
          className="text-xl leading-[1.875rem] font-semibold text-slate-950"
        >
          {formatPartTimeScheduleSummaryTitle(date, today)}
        </h2>
        {hasSchedules && (
          <p className="text-base font-medium text-slate-600">
            {checkedInCount}/{schedules.length} 완료
          </p>
        )}
      </div>
      {hasSchedules ? (
        <>
          <div
            aria-hidden="true"
            className="h-2 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-primary-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <ul className="flex flex-col gap-1">
            {schedules.map((schedule) => {
              const { id, startTime, endTime, staff, isCheckedIn } = schedule;

              return (
                <li key={id} className="flex items-center gap-2 px-1 py-1.5">
                  <label className="flex min-w-0 flex-1 items-center gap-1">
                    <Checkbox checked={isCheckedIn} readOnly />
                    <span className="truncate text-sm font-medium tracking-[-0.03em] text-[#737373]">
                      {startTime} ~ {endTime} {staff.name}
                    </span>
                  </label>
                  <div className="flex shrink-0 items-center gap-1">
                    <TextButton
                      size="small"
                      aria-label={`${startTime} ~ ${endTime} ${staff.name} 스케쥴 수정`}
                      className="text-slate-400"
                      onClick={() => onScheduleEdit(schedule)}
                    >
                      수정
                    </TextButton>
                    <span
                      aria-hidden="true"
                      className="h-3 w-px bg-slate-200"
                    />
                    <TextButton
                      size="small"
                      aria-label={`${startTime} ~ ${endTime} ${staff.name} 스케쥴 삭제`}
                      onClick={() => onScheduleDelete(schedule)}
                    >
                      삭제
                    </TextButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      ) : (
        <p className="text-sm font-medium tracking-[-0.03em] text-[#737373]">
          등록된 스케쥴이 없습니다.
        </p>
      )}
    </section>
  );
}

export { PartTimeScheduleDaySummary };
