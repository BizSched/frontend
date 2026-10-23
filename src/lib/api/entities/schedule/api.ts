import type {
  AttendanceUpdateRequest,
  FindAll2Params,
  ScheduleCreateRequest,
  ScheduleUpdateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';
import {
  changeAttendance,
  create2,
  delete3,
  findAll2,
  update2,
} from '@lib/api/generated/schedule/schedule';
import {
  ChangeAttendanceResponse,
  Create2Response,
  Delete3Response,
  FindAll2Response,
  Update2Response,
} from '@lib/api/generated/schedule/schedule.zod';

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

const createSchedule = async (body: ScheduleCreateRequest) =>
  toPartTimeSchedule(Create2Response.parse(await create2(body)));

const updateSchedule = async (
  scheduleId: number,
  body: ScheduleUpdateRequest,
) => toPartTimeSchedule(Update2Response.parse(await update2(scheduleId, body)));

const deleteSchedule = async (scheduleId: number) =>
  Delete3Response.parse(await delete3(scheduleId)).id;

const changeScheduleAttendance = async (
  scheduleId: number,
  body: AttendanceUpdateRequest,
) => {
  const response = ChangeAttendanceResponse.parse(
    await changeAttendance(scheduleId, body),
  );
  return {
    id: response.scheduleId,
    isCheckedIn: response.attendanceStatus === 'ATTENDED',
  };
};

export {
  changeScheduleAttendance,
  createSchedule,
  deleteSchedule,
  getScheduleList,
  updateSchedule,
};
export type { ScheduleListParams };
