'use client';

import { useQuery } from '@tanstack/react-query';

import { staffOptionsQueryOptions } from '@hooks/api/staff/staffQueryOptions';

import type { FindAll1EmploymentStatus } from '@lib/api/generated/bizSchedAPI.schemas';

const useStaffOptions = (employmentStatus?: FindAll1EmploymentStatus) =>
  useQuery(staffOptionsQueryOptions(employmentStatus));

export { useStaffOptions };
