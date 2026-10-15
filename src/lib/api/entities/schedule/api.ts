import type { FindAll2Params } from '@lib/api/generated/bizSchedAPI.schemas';
import { findAll2 } from '@lib/api/generated/schedule/schedule';
import { FindAll2Response } from '@lib/api/generated/schedule/schedule.zod';

import { toPartTimeSchedule } from './toPartTimeSchedule';

const MAX_PAGE_SIZE = 100;

type ScheduleListParams = Omit<FindAll2Params, 'page' | 'size'>;

const getScheduleList = async (
  params: ScheduleListParams,
  options?: RequestInit,
) => {
  const fetchPage = async (page: number) =>
    FindAll2Response.parse(
      await findAll2({ ...params, page, size: MAX_PAGE_SIZE }, options),
    );
  const first = await fetchPage(1);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPage - 1) }, (_, index) =>
      fetchPage(index + 2),
    ),
  );
  return [first, ...rest].flatMap(({ items }) => items.map(toPartTimeSchedule));
};

export { getScheduleList };
export type { ScheduleListParams };
