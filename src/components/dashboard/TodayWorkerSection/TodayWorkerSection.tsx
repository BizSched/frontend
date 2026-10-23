'use client';

import Image from 'next/image';

import { Card } from '@components/_common/Card/Card';

import { useScheduleList } from '@hooks/api/schedule/useScheduleList';

import { formatCommonError } from '@lib/api/formatCommonError';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import { cn } from '@lib/utilities/cn';
import {
  groupPartTimeSchedulesByShift,
  SHIFT_PERIODS,
  type ShiftPeriod,
} from '@lib/utilities/partTime/partTimeSchedule';
import { typographyVariants } from '@lib/utilities/typography';

import IcEmpty from '@assets/icons/ic_empty.svg';

import { WorkerCard } from './WorkerCard';

interface TodayWorkerSectionProps {
  today: string;
}

function TodayWorkerSection({ today }: TodayWorkerSectionProps) {
  const { data, error, refetch } = useScheduleList({
    from: today,
    to: today,
  });
  const groups = data && groupPartTimeSchedulesByShift(data);
  const isEmpty =
    groups && SHIFT_PERIODS.every((period) => groups[period].length === 0);

  return (
    <Card padding="lg" className="gap-6" data-testid="today-worker">
      <Card.Header className="justify-center">
        <Card.Title className={typographyVariants({ role: 'sectionTitle' })}>
          오늘 근무 아르바이트생
        </Card.Title>
      </Card.Header>

      <Card.Content className="min-h-52">
        {isEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            <Image src={IcEmpty} alt="" width={100} height={128} unoptimized />
            <span
              className={cn(
                typographyVariants({ role: 'subtitle' }),
                'text-slate-400',
              )}
            >
              오늘 근무하는 알바생이 없습니다
            </span>
          </div>
        ) : groups ? (
          <>
            <div className="grid grid-cols-4 gap-4 max-tablet:hidden">
              {SHIFT_PERIODS.map((period) => (
                <ShiftColumn
                  key={period}
                  period={period}
                  schedules={groups[period]}
                />
              ))}
            </div>

            <div className="hidden max-tablet:flex max-tablet:flex-col max-tablet:gap-4">
              {SHIFT_PERIODS.map((period) => (
                <div key={period} className="flex items-start gap-3">
                  <span
                    className={cn(
                      typographyVariants({ role: 'label' }),
                      'w-8 shrink-0 pt-2 text-slate-400',
                    )}
                  >
                    {period}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-2">
                    <WorkerList schedules={groups[period]} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : error ? (
          <div
            role="alert"
            className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-sm text-slate-500"
          >
            <p>{formatCommonError(error)}</p>
            <button
              type="button"
              onClick={() => {
                void refetch();
              }}
              className="cursor-pointer font-semibold text-slate-700 underline"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <p
            role="status"
            className={cn(
              typographyVariants({ role: 'supporting' }),
              'flex flex-1 items-center justify-center text-slate-500',
            )}
          >
            불러오는 중
          </p>
        )}
      </Card.Content>
    </Card>
  );
}

function WorkerList({ schedules }: { schedules: PartTimeSchedule[] }) {
  if (schedules.length === 0) {
    return (
      <span
        className={cn(
          typographyVariants({ role: 'supporting' }),
          'py-2 text-slate-400',
        )}
      >
        근무자 없음
      </span>
    );
  }

  return schedules.map((schedule) => (
    <WorkerCard key={schedule.id} schedule={schedule} />
  ));
}

function ShiftColumn({
  period,
  schedules,
}: {
  period: ShiftPeriod;
  schedules: PartTimeSchedule[];
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="border-1.5 flex-1 border-t border-dashed border-primary-400" />
        <span
          className={cn(
            typographyVariants({ role: 'label' }),
            'shrink-0 text-slate-950',
          )}
        >
          {period}
        </span>
        <div className="border-1.5 flex-1 border-t border-dashed border-primary-400" />
      </div>

      <div className="flex flex-col gap-2">
        <WorkerList schedules={schedules} />
      </div>
    </div>
  );
}

export { TodayWorkerSection };
