'use client';

import { useQuery } from '@tanstack/react-query';

import { staffDetailQueryOptions } from '@hooks/api/staff/staffQueryOptions';

const useStaffDetail = (staffId: number) =>
  useQuery({
    ...staffDetailQueryOptions(staffId),
    enabled: Number.isSafeInteger(staffId) && staffId > 0,
    throwOnError: false,
  });

export { useStaffDetail };
