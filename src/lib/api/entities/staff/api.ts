import type { FindAll1Params } from '@lib/api/generated/bizSchedAPI.schemas';
import {
  downloadAttachment,
  findAll1,
  findById1,
} from '@lib/api/generated/staff/staff';
import {
  FindAll1Response,
  FindById1Response,
} from '@lib/api/generated/staff/staff.zod';
import { getPartTimeStaffAttachmentType } from '@lib/utilities/partTime/partTimeStaffAttachment';

import { toPartTimeStaffDetail } from './toPartTimeStaffDetail';
import { toPartTimeStaffList } from './toPartTimeStaffList';

const getStaffList = async (params?: FindAll1Params, options?: RequestInit) =>
  toPartTimeStaffList(FindAll1Response.parse(await findAll1(params, options)));

const getStaffDetail = async (staffId: number, options?: RequestInit) =>
  toPartTimeStaffDetail(
    FindById1Response.parse(await findById1(staffId, options)),
  );

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

export { getStaffList, getStaffDetail, getStaffAttachment };
