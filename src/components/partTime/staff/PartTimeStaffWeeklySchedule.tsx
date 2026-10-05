import { cva } from 'class-variance-authority';
import Image from 'next/image';

import { CalendarEventChip } from '@components/_common/Calendar/CalendarEventChip';

import type {
  PartTimeStaffShift,
  PartTimeStaffShiftStatus,
} from '@lib/types/partTimeStaff';
import {
  formatPartTimeStaffShiftTime,
  formatPartTimeStaffWeekTitle,
  getPartTimeStaffShiftStatus,
  getPartTimeStaffWeekDates,
} from '@lib/utilities/partTime/partTimeStaff';

import IcCheckbox from '@assets/icons/ic_checkbox.svg';

const weeklyShiftChipVariants = cva('justify-center gap-0 px-0.5', {
  variants: {
    status: {
      scheduled: '',
      completed: '',
      missed: 'border-warning-300 bg-warning-50 text-warning-600',
    },
  },
});

const weeklyShiftDotVariants = cva(
  'mt-0.5 hidden size-1.5 shrink-0 rounded-full max-tablet:block',
  {
    variants: {
      status: {
        none: 'bg-transparent',
        scheduled: 'bg-primary-500',
        completed: 'bg-slate-400',
        missed: 'bg-warning-500',
      },
    },
  },
);

const getWeeklyShiftDotStatus = (statuses: PartTimeStaffShiftStatus[]) => {
  if (statuses.length === 0) {
    return 'none';
  }

  if (statuses.includes('missed')) {
    return 'missed';
  }

  return statuses.includes('scheduled') ? 'scheduled' : 'completed';
};

interface PartTimeStaffWeeklyScheduleProps {
  now: string;
  shifts: PartTimeStaffShift[];
}

function PartTimeStaffWeeklySchedule({
  now,
  shifts,
}: PartTimeStaffWeeklyScheduleProps) {
  const today = now.slice(0, 10);
  const weekDates = getPartTimeStaffWeekDates(today);

  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-lg leading-7 font-semibold text-slate-900">
        {formatPartTimeStaffWeekTitle(today)}
      </h3>
      <ol className="grid grid-cols-7 gap-2 max-tablet:gap-0">
        {weekDates.map((date) => {
          const dayShifts = shifts
            .filter((shift) => shift.date === date)
            .map((shift) => ({
              shift,
              status: getPartTimeStaffShiftStatus(shift, now),
            }));

          return (
            <li
              key={date}
              className="flex min-w-0 flex-col gap-0.5 max-tablet:flex-row max-tablet:justify-center max-tablet:gap-0.75"
            >
              <time
                dateTime={date}
                className="text-xs leading-4 font-semibold text-slate-600 tabular-nums max-tablet:w-3.5 max-tablet:text-center"
              >
                {Number(date.slice(8))}
              </time>
              <span
                aria-hidden="true"
                className={weeklyShiftDotVariants({
                  status: getWeeklyShiftDotStatus(
                    dayShifts.map(({ status }) => status),
                  ),
                })}
              />
              {dayShifts.length > 0 && (
                <ul className="flex flex-col gap-1 max-tablet:sr-only">
                  {dayShifts.map(({ shift, status }) => (
                    <li key={shift.id}>
                      <CalendarEventChip
                        label={formatPartTimeStaffShiftTime(shift)}
                        tone={status === 'completed' ? 'muted' : 'accent'}
                        leadingSlot={
                          <>
                            {status === 'completed' && (
                              <Image
                                src={IcCheckbox}
                                alt="완료"
                                width={16}
                                height={16}
                                unoptimized
                              />
                            )}
                            {status === 'missed' && (
                              <span className="sr-only">미출근</span>
                            )}
                          </>
                        }
                        className={weeklyShiftChipVariants({ status })}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export { PartTimeStaffWeeklySchedule };
export type { PartTimeStaffWeeklyScheduleProps };
