'use client';

import { useQuery } from '@tanstack/react-query';

import { staffListQueryOptions } from '@hooks/api/staff/staffQueryOptions';

import type { FindAll1Params } from '@lib/api/generated/bizSchedAPI.schemas';

const useStaffList = (params?: FindAll1Params) =>
  useQuery(staffListQueryOptions(params));

export { useStaffList };
