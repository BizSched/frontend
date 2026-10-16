import type {
  FindAll1EmploymentStatus,
  FindAll1Params,
} from '@lib/api/generated/bizSchedAPI.schemas';
import {
  delete2,
  downloadAttachment,
  findAll1,
  findById1,
} from '@lib/api/generated/staff/staff';
import {
  Delete2Response,
  FindAll1Response,
  FindById1Response,
} from '@lib/api/generated/staff/staff.zod';
import { getPartTimeStaffAttachmentType } from '@lib/utilities/partTime/partTimeStaffAttachment';

import { toPartTimeStaff } from './toPartTimeStaff';
import { toPartTimeStaffDetail } from './toPartTimeStaffDetail';
import { toPartTimeStaffList } from './toPartTimeStaffList';

const MAX_PAGE_SIZE = 100;

const getStaffList = async (params?: FindAll1Params, options?: RequestInit) =>
  toPartTimeStaffList(FindAll1Response.parse(await findAll1(params, options)));

const getAllStaffs = async (
  employmentStatus?: FindAll1EmploymentStatus,
  options?: RequestInit,
) => {
  const fetchPage = async (page: number) =>
    FindAll1Response.parse(
      await findAll1({ employmentStatus, page, size: MAX_PAGE_SIZE }, options),
    );
  const first = await fetchPage(1);
  const rest = await Promise.all(
    Array.from({ length: Math.max(0, first.totalPage - 1) }, (_, index) =>
      fetchPage(index + 2),
    ),
  );
  return [first, ...rest].flatMap(({ items }) => items.map(toPartTimeStaff));
};

const getStaffDetail = async (staffId: number, options?: RequestInit) =>
  toPartTimeStaffDetail(
    FindById1Response.parse(await findById1(staffId, options)),
  );

const deleteStaff = async (staffId: number) =>
  Delete2Response.parse(await delete2(staffId)).id;

const getStaffAttachment = async (url: string, options?: RequestInit) => {
  const path = /^\/api\/staff\/(\d+)\/attachments\/(\d+)$/.exec(url);
  if (!path) throw new Error('Invalid staff attachment URL');
  const blob = await downloadAttachment(Number(path[1]), Number(path[2]), {
    ...options,
    responseType: 'blob',
  });
  if (!getPartTimeStaffAttachmentType(blob.type)) {
    throw new Error('Unsupported staff attachment MIME type');
  }
  return blob;
};

export {
  deleteStaff,
  getAllStaffs,
  getStaffList,
  getStaffDetail,
  getStaffAttachment,
};
