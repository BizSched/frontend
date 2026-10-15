import type { z } from 'zod';

import type { FindAll1Response } from '@lib/api/generated/staff/staff.zod';
import type { PartTimeStaffListResponse } from '@lib/types/partTimeStaff';

const toPartTimeStaffList = (
  dto: z.infer<typeof FindAll1Response>,
): PartTimeStaffListResponse => ({
  ...dto,
  items: dto.items.map(({ id, name, phone, createdAt }) => ({
    id,
    name,
    phone,
    createdAt,
  })),
});

export { toPartTimeStaffList };
