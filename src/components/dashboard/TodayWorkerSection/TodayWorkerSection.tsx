'use client';

import { Card } from '@components/_common/Card/Card';

import { useScheduleList } from '@hooks/api/schedule/useScheduleList';

import { formatCommonError } from '@lib/api/formatCommonError';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import {
  groupPartTimeSchedulesByShift,
  SHIFT_PERIODS,
  type ShiftPeriod,
} from '@lib/utilities/partTime/partTimeSchedule';

import { WorkerCard } from './WorkerCard';

interface TodayWorkerSectionProps {
  today: string;
}

function TodayWorkerSection({ today }: TodayWorkerSectionProps) {
  const { data, error } = useScheduleList({ from: today, to: today });
  const groups = data && groupPartTimeSchedulesByShift(data);

  return (
    <Card padding="lg" className="gap-6">
      <Card.Header className="justify-center">
        <Card.Title>오늘 근무 알바생</Card.Title>
      </Card.Header>

      <Card.Content>
        {groups ? (
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
                  <span className="w-8 shrink-0 pt-2 text-sm font-semibold text-slate-400">
                    {period}
                  </span>
                  <div className="flex flex-1 flex-wrap gap-2">
                    <WorkerList schedules={groups[period]} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="py-6 text-center text-sm text-slate-500">
            {error ? formatCommonError(error) : '불러오는 중'}
          </p>
        )}
      </Card.Content>
    </Card>
  );
}

function WorkerList({ schedules }: { schedules: PartTimeSchedule[] }) {
  if (schedules.length === 0) {
    return <span className="py-2 text-sm text-slate-300">근무자 없음</span>;
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
        <span className="shrink-0 text-sm font-semibold text-slate-950">
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
