import type { z } from 'zod';

import type { FindAll1Response } from '@lib/api/generated/staff/staff.zod';
import type { PartTimeStaff } from '@lib/types/partTimeSchedule';

const toPartTimeStaff = ({
  id,
  name,
}: z.infer<typeof FindAll1Response>['items'][number]): PartTimeStaff => ({
  id,
  name,
  isDeleted: false,
});

export { toPartTimeStaff };
