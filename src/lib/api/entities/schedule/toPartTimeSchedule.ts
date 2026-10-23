import type { z } from 'zod';

import type { FindAll2Response } from '@lib/api/generated/schedule/schedule.zod';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

const toPartTimeSchedule = ({
  id,
  staff,
  workDate,
  startTime,
  endTime,
  isCheckedIn,
  memo,
}: z.infer<typeof FindAll2Response>['items'][number]): PartTimeSchedule => ({
  id,
  staff: { id: staff.id, name: staff.name, isDeleted: staff.isDeleted },
  date: workDate,
  startTime,
  endTime,
  isCheckedIn,
  memo: memo ?? '',
});

export { toPartTimeSchedule };
