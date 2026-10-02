import { Card } from '@components/_common/Card/Card';

import { WorkerCard } from './WorkerCard';

/** 시간대별 근무 구분 */
type ShiftPeriod = '오전' | '오후' | '저녁' | '야간';

/** 알바생 더미 데이터 — 추후 API 연동 시 교체 */
interface WorkerShift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
}

const SHIFT_PERIODS: ShiftPeriod[] = ['오전', '오후', '저녁', '야간'];

const MOCK_WORKERS: Record<ShiftPeriod, WorkerShift[]> = {
  오전: [
    {
      id: '1',
      name: '신짱구',
      startTime: '12:00',
      endTime: '18:00',
      duration: '6시간',
    },
  ],
  오후: [
    {
      id: '2',
      name: '봉미선',
      startTime: '12:00',
      endTime: '18:00',
      duration: '6시간',
    },
    {
      id: '3',
      name: '신형만',
      startTime: '13:00',
      endTime: '16:00',
      duration: '3시간',
    },
  ],
  저녁: [
    {
      id: '4',
      name: '김철수',
      startTime: '12:00',
      endTime: '18:00',
      duration: '6시간',
    },
  ],
  야간: [
    {
      id: '5',
      name: '나미리',
      startTime: '12:00',
      endTime: '18:00',
      duration: '6시간',
    },
  ],
};

function TodayWorkerSection() {
  return (
    <Card padding="lg" className="gap-6">
      <Card.Header className="justify-center">
        <Card.Title>오늘 근무 알바생</Card.Title>
      </Card.Header>

      <Card.Content>
        <div className="grid grid-cols-4 gap-4 max-tablet:hidden">
          {SHIFT_PERIODS.map((period) => (
            <ShiftColumn
              key={period}
              period={period}
              workers={MOCK_WORKERS[period]}
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
                {MOCK_WORKERS[period].map((worker) => (
                  <WorkerCard key={worker.id} worker={worker} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function ShiftColumn({
  period,
  workers,
}: {
  period: ShiftPeriod;
  workers: WorkerShift[];
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
        {workers.map((worker) => (
          <WorkerCard key={worker.id} worker={worker} />
        ))}
      </div>
    </div>
  );
}

export { TodayWorkerSection };
export type { WorkerShift, ShiftPeriod };
