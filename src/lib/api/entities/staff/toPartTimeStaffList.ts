import type { z } from 'zod';

import type { FindAll1Response } from '@lib/api/generated/staff/staff.zod';
import type { PartTimeStaffListResponse } from '@lib/types/partTimeStaff';

import { toPartTimeStaffEmploymentStatus } from './toPartTimeStaffEmploymentStatus';

const toPartTimeStaffList = (
  dto: z.infer<typeof FindAll1Response>,
): PartTimeStaffListResponse => ({
  ...dto,
  items: dto.items.map(({ id, name, phone, createdAt, employmentStatus }) => ({
    id,
    name,
    phone,
    createdAt,
    employmentStatus: toPartTimeStaffEmploymentStatus(employmentStatus),
  })),
});

export { toPartTimeStaffList };
