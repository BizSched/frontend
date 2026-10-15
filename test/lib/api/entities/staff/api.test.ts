import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { ApiError } from '@lib/api/apiError';
import {
  getAllStaffs,
  getStaffAttachment,
  getStaffDetail,
  getStaffList,
} from '@lib/api/entities/staff/api';
import {
  downloadAttachment,
  findAll1,
  findById1,
} from '@lib/api/generated/staff/staff';

vi.mock('@lib/api/generated/staff/staff', () => ({
  findAll1: vi.fn(),
  findById1: vi.fn(),
  downloadAttachment: vi.fn(),
}));

const STAFF = {
  id: 42,
  name: '김알바',
  phone: null,
  employmentStatus: 'ON_LEAVE' as const,
  createdAt: '2026-10-14T09:00:00+09:00',
};
const DETAIL = {
  ...STAFF,
  birthDate: null,
  gender: null,
  hourlyWage: null,
  note: null,
  updatedAt: STAFF.createdAt,
  attachments: [],
};

beforeEach(() => vi.resetAllMocks());

describe('staff API', () => {
  it.each(['text/html', 'image/svg+xml', 'application/xhtml+xml', ''])(
    '다운로드 경로가 PDF여도 실제 Blob MIME %s는 미리보기로 반환하지 않는다',
    async (type) => {
      vi.mocked(downloadAttachment).mockResolvedValue(
        new Blob(['<script>alert(1)</script>'], { type }),
      );
      await expect(
        getStaffAttachment('/api/staff/42/attachments/3'),
      ).rejects.toThrow('Unsupported staff attachment MIME type');
    },
  );

  it('첨부파일은 생성 함수의 Blob 옵션과 취소 signal로 받는다', async () => {
    const blob = new Blob(['file'], { type: 'application/pdf' });
    const signal = new AbortController().signal;
    vi.mocked(downloadAttachment).mockResolvedValue(blob);
    await expect(
      getStaffAttachment('/api/staff/42/attachments/3', { signal }),
    ).resolves.toBe(blob);
    expect(downloadAttachment).toHaveBeenCalledWith(42, 3, {
      signal,
      responseType: 'blob',
    });
  });

  it('목록의 빈 번호와 페이지 정보를 유지하고 재직 상태 필터 없이 요청한다', async () => {
    const params = { page: 2, size: 10 };
    const options = { headers: { Authorization: 'Bearer access' } };
    vi.mocked(findAll1).mockResolvedValue({
      page: 2,
      size: 10,
      totalCount: 11,
      totalPage: 2,
      items: [STAFF],
    });
    const result = await getStaffList(params, options);
    expect(findAll1).toHaveBeenCalledWith(params, options);
    expect(result).toMatchObject({
      totalCount: 11,
      totalPage: 2,
      items: [{ id: 42, phone: null }],
    });
  });

  it('선택 필드가 모두 비어 있는 상세를 변환한다', async () => {
    vi.mocked(findById1).mockResolvedValue(DETAIL);
    await expect(getStaffDetail(42)).resolves.toEqual({
      id: 42,
      name: STAFF.name,
      phone: null,
      createdAt: STAFF.createdAt,
      birthDate: null,
      gender: null,
      hourlyWage: null,
      memo: null,
      attachments: [],
    });
    expect(findById1).toHaveBeenCalledWith(42, undefined);
  });

  it('성별·메모·PDF와 이미지 첨부파일을 FE 타입으로 바꾼다', async () => {
    vi.mocked(findById1).mockResolvedValue({
      ...DETAIL,
      gender: 'FEMALE',
      hourlyWage: 0,
      note: '메모\n두 번째 줄',
      attachments: [
        {
          id: 3,
          fileName: '계약서.pdf',
          contentType: 'application/pdf',
          downloadUrl: '/api/staff/42/attachments/3',
          fileSize: 100,
          createdAt: STAFF.createdAt,
        },
        {
          id: 4,
          fileName: '보건증.png',
          contentType: 'image/png',
          downloadUrl: '/api/staff/42/attachments/4',
          fileSize: 100,
          createdAt: STAFF.createdAt,
        },
      ],
    });
    await expect(getStaffDetail(42)).resolves.toMatchObject({
      gender: 'female',
      hourlyWage: 0,
      memo: '메모\n두 번째 줄',
      attachments: [
        {
          id: 3,
          name: '계약서.pdf',
          type: 'pdf',
          url: '/api/staff/42/attachments/3',
        },
        {
          id: 4,
          name: '보건증.png',
          type: 'image',
          url: '/api/staff/42/attachments/4',
        },
      ],
    });
  });

  it('깨진 응답을 검증하고 404를 그대로 전달한다', async () => {
    vi.mocked(findById1).mockResolvedValue({ ...DETAIL, id: '42' } as never);
    await expect(getStaffDetail(42)).rejects.toBeInstanceOf(ZodError);
    const error = new ApiError(
      'STAFF_NOT_FOUND',
      404,
      '아르바이트생을 찾을 수 없어요.',
    );
    vi.mocked(findById1).mockRejectedValue(error);
    await expect(getStaffDetail(42)).rejects.toBe(error);
  });
});

describe('getAllStaffs', () => {
  const createPage = (page: number, totalPage: number, ids: number[]) => ({
    page,
    size: 100,
    totalCount: ids.length,
    totalPage,
    items: ids.map((id) => ({ ...STAFF, id, name: `알바${id}` })),
  });

  it('100명 단위로 totalPage까지 이어 받아 옵션 타입으로 바꾼다', async () => {
    vi.mocked(findAll1).mockImplementation(async (params) =>
      params?.page === 1 ? createPage(1, 2, [1, 2]) : createPage(2, 2, [3]),
    );

    await expect(getAllStaffs('EMPLOYED')).resolves.toEqual([
      { id: 1, name: '알바1', isDeleted: false },
      { id: 2, name: '알바2', isDeleted: false },
      { id: 3, name: '알바3', isDeleted: false },
    ]);
    expect(findAll1).toHaveBeenCalledWith(
      { employmentStatus: 'EMPLOYED', page: 2, size: 100 },
      undefined,
    );
  });

  it('재직 상태를 주지 않으면 전체를 받는다', async () => {
    vi.mocked(findAll1).mockResolvedValue(createPage(1, 1, [1]));

    await getAllStaffs();

    expect(findAll1).toHaveBeenCalledTimes(1);
    expect(findAll1).toHaveBeenCalledWith(
      { employmentStatus: undefined, page: 1, size: 100 },
      undefined,
    );
  });
});
