import { match } from 'ts-pattern';

import type { EmploymentStatusUpdateRequestEmploymentStatus } from '@lib/api/generated/bizSchedAPI.schemas';
import type { PartTimeStaffEmploymentStatus } from '@lib/types/partTimeStaff';

const toPartTimeStaffEmploymentStatus = (
  employmentStatus: EmploymentStatusUpdateRequestEmploymentStatus,
): PartTimeStaffEmploymentStatus =>
  match(employmentStatus)
    .with('EMPLOYED', () => 'employed' as const)
    .with('ON_LEAVE', () => 'onLeave' as const)
    .with('RESIGNED', () => 'resigned' as const)
    .exhaustive();

const toEmploymentStatusRequest = (
  employmentStatus: PartTimeStaffEmploymentStatus,
): EmploymentStatusUpdateRequestEmploymentStatus =>
  match(employmentStatus)
    .with('employed', () => 'EMPLOYED' as const)
    .with('onLeave', () => 'ON_LEAVE' as const)
    .with('resigned', () => 'RESIGNED' as const)
    .exhaustive();

export { toEmploymentStatusRequest, toPartTimeStaffEmploymentStatus };
