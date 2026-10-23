import type {
  PartTimeSchedule,
  PartTimeScheduleFormResult,
} from '@lib/types/partTimeSchedule';

const getPartTimeScheduleChanges = (
  values: PartTimeScheduleFormResult,
  schedule: PartTimeSchedule,
) => {
  const changes: Partial<PartTimeScheduleFormResult> = {};
  if (values.staffId !== schedule.staff.id) changes.staffId = values.staffId;
  if (values.date !== schedule.date) changes.date = values.date;
  if (values.startTime !== schedule.startTime)
    changes.startTime = values.startTime;
  if (values.endTime !== schedule.endTime) changes.endTime = values.endTime;
  const memo = values.memo.trim();
  if (memo !== schedule.memo.trim()) changes.memo = memo;

  return Object.keys(changes).length > 0 ? changes : null;
};

export { getPartTimeScheduleChanges };
