import { customFetcher } from '@lib/api/customFetcher';
import type {
  FindAll1EmploymentStatus,
  FindAll1Params,
  StaffCreateRequest,
  StaffUpdateRequest,
} from '@lib/api/generated/bizSchedAPI.schemas';
import {
  changeEmploymentStatus,
  delete2,
  deleteAttachment,
  downloadAttachment,
  findAll1,
  findById1,
  getCreateWithFilesUrl,
  getUpdateWithFilesUrl,
} from '@lib/api/generated/staff/staff';
import {
  ChangeEmploymentStatusResponse,
  CreateWithFilesResponse,
  Delete2Response,
  FindAll1Response,
  FindById1Response,
  UpdateWithFilesResponse,
} from '@lib/api/generated/staff/staff.zod';
import type { PartTimeStaffEmploymentStatus } from '@lib/types/partTimeStaff';
import {
  PART_TIME_STAFF_ATTACHMENT_MAX_BYTES,
  PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE,
  getPartTimeStaffAttachmentType,
} from '@lib/utilities/partTime/partTimeStaffAttachment';

import { toPartTimeStaff } from './toPartTimeStaff';
import { toPartTimeStaffDetail } from './toPartTimeStaffDetail';
import {
  toEmploymentStatusRequest,
  toPartTimeStaffEmploymentStatus,
} from './toPartTimeStaffEmploymentStatus';
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

const changeStaffEmploymentStatus = async (
  staffId: number,
  employmentStatus: PartTimeStaffEmploymentStatus,
) => {
  const response = ChangeEmploymentStatusResponse.parse(
    await changeEmploymentStatus(staffId, {
      employmentStatus: toEmploymentStatusRequest(employmentStatus),
    }),
  );
  return {
    id: response.id,
    employmentStatus: toPartTimeStaffEmploymentStatus(
      response.employmentStatus,
    ),
  };
};

// NOTE: 생성 함수는 multipart만 만들고 attachments를 다루지 않아 전송만 직접 작성한다.
const createStaff = async (body: StaffCreateRequest) =>
  toPartTimeStaffDetail(
    CreateWithFilesResponse.parse(
      await customFetcher(getCreateWithFilesUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    ),
  );

const updateStaff = async (staffId: number, body: StaffUpdateRequest) =>
  toPartTimeStaffDetail(
    UpdateWithFilesResponse.parse(
      await customFetcher(getUpdateWithFilesUrl(staffId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }),
    ),
  );

const uploadStaffAttachment = async (staffId: number, file: File) => {
  if (!getPartTimeStaffAttachmentType(file.type))
    throw new Error('Unsupported staff attachment MIME type');
  if (file.size > PART_TIME_STAFF_ATTACHMENT_MAX_BYTES)
    throw new Error(PART_TIME_STAFF_ATTACHMENT_SIZE_MESSAGE);
  const body = new FormData();
  body.append('attachments', file);
  return toPartTimeStaffDetail(
    UpdateWithFilesResponse.parse(
      await customFetcher(getUpdateWithFilesUrl(staffId), {
        method: 'PATCH',
        body,
      }),
    ),
  );
};

const deleteStaffAttachment = async (staffId: number, attachmentId: number) =>
  deleteAttachment(staffId, attachmentId);

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
  changeStaffEmploymentStatus,
  createStaff,
  deleteStaff,
  deleteStaffAttachment,
  getAllStaffs,
  getStaffList,
  getStaffDetail,
  getStaffAttachment,
  updateStaff,
  uploadStaffAttachment,
};
