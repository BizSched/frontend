import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import { ApiError } from '@lib/api/apiError';
import { customFetcher } from '@lib/api/customFetcher';
import {
  changeStaffEmploymentStatus,
  createStaff,
  deleteStaff,
  deleteStaffAttachment,
  getAllStaffs,
  getStaffAttachment,
  getStaffDetail,
  getStaffList,
  updateStaff,
  uploadStaffAttachment,
} from '@lib/api/entities/staff/api';
import {
  changeEmploymentStatus,
  delete2,
  deleteAttachment,
  downloadAttachment,
  findAll1,
  findById1,
} from '@lib/api/generated/staff/staff';

vi.mock('@lib/api/generated/staff/staff', () => ({
  changeEmploymentStatus: vi.fn(),
  delete2: vi.fn(),
  deleteAttachment: vi.fn(),
  getCreateWithFilesUrl: () => '/api/staff',
  getUpdateWithFilesUrl: (staffId: number) => `/api/staff/${staffId}`,
  findAll1: vi.fn(),
  findById1: vi.fn(),
  downloadAttachment: vi.fn(),
}));

vi.mock('@lib/api/customFetcher', () => ({ customFetcher: vi.fn() }));

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
  it('직원 정보만 JSON으로 등록하고 검증한 FE 상세를 반환한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue(DETAIL);
    const body = { name: '김알바', note: '' };
    await expect(createStaff(body)).resolves.toMatchObject({
      id: 42,
      name: '김알바',
      memo: null,
    });
    expect(customFetcher).toHaveBeenCalledWith('/api/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });

  it('수정 필드와 메모 삭제를 JSON PATCH로 전송한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({ ...DETAIL, note: '' });
    await expect(updateStaff(42, { note: '' })).resolves.toMatchObject({
      memo: '',
    });
    expect(customFetcher).toHaveBeenCalledWith('/api/staff/42', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{"note":""}',
    });
  });

  it('파일 하나만 attachments 파트로 보내고 boundary는 브라우저가 지정한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue(DETAIL);
    const file = new File(['pdf'], '계약서.pdf', { type: 'application/pdf' });
    await uploadStaffAttachment(42, file);
    const [url, options] = vi.mocked(customFetcher).mock.calls[0];
    expect(url).toBe('/api/staff/42');
    expect(options?.method).toBe('PATCH');
    expect(options?.headers).toBeUndefined();
    const body = options?.body as FormData;
    expect([...body.keys()]).toEqual(['attachments']);
    expect(body.get('attachments')).toBe(file);
  });

  it('쓰기 응답도 검증하며 잘못된 응답과 BE 실패를 전달한다', async () => {
    vi.mocked(customFetcher).mockResolvedValue({ ...DETAIL, id: '42' });
    await expect(createStaff({ name: '김알바' })).rejects.toBeInstanceOf(
      ZodError,
    );
    await expect(updateStaff(42, { note: '' })).rejects.toBeInstanceOf(
      ZodError,
    );
    const error = new ApiError(
      'VALIDATION_ERROR',
      400,
      '파일 개수를 확인해주세요.',
    );
    vi.mocked(customFetcher).mockRejectedValue(error);
    await expect(
      uploadStaffAttachment(
        42,
        new File(['pdf'], '파일.pdf', { type: 'application/pdf' }),
      ),
    ).rejects.toBe(error);
  });

  it('첨부파일 삭제의 204 빈 응답을 그대로 처리한다', async () => {
    vi.mocked(deleteAttachment).mockResolvedValue(undefined);
    await expect(deleteStaffAttachment(42, 3)).resolves.toBeUndefined();
    expect(deleteAttachment).toHaveBeenCalledWith(42, 3);
  });

  it('SVG와 요청 한도를 넘는 파일은 전송하지 않는다', async () => {
    await expect(
      uploadStaffAttachment(
        42,
        new File(['svg'], '사진.svg', { type: 'image/svg+xml' }),
      ),
    ).rejects.toThrow('Unsupported');
    const large = new File(
      [new Uint8Array(3.5 * 1024 * 1024 + 1)],
      '계약서.pdf',
      { type: 'application/pdf' },
    );
    await expect(uploadStaffAttachment(42, large)).rejects.toThrow('3.5MB');
    expect(customFetcher).not.toHaveBeenCalled();
  });

  it('WebP 파일을 multipart로 올리고 상세·다운로드에서 이미지로 처리한다', async () => {
    const file = new File(['webp'], '사진.webp', { type: 'image/webp' });
    const detail = {
      ...DETAIL,
      attachments: [
        {
          id: 7,
          fileName: '사진.webp',
          contentType: 'image/webp',
          fileSize: file.size,
          downloadUrl: '/api/staff/42/attachments/7',
          createdAt: STAFF.createdAt,
        },
      ],
    };
    vi.mocked(customFetcher).mockResolvedValue(detail);
    await expect(uploadStaffAttachment(42, file)).resolves.toMatchObject({
      attachments: [{ id: 7, name: '사진.webp', type: 'image' }],
    });
    const body = vi.mocked(customFetcher).mock.calls[0][1]?.body as FormData;
    expect(body.get('attachments')).toBe(file);
    vi.mocked(findById1).mockResolvedValue(detail);
    await expect(getStaffDetail(42)).resolves.toMatchObject({
      attachments: [{ id: 7, type: 'image' }],
    });
    const blob = new Blob(['webp'], { type: 'image/webp' });
    vi.mocked(downloadAttachment).mockResolvedValue(blob);
    await expect(
      getStaffAttachment('/api/staff/42/attachments/7'),
    ).resolves.toBe(blob);
  });
  it('삭제 응답을 검증하고 삭제된 ID를 반환한다', async () => {
    vi.mocked(delete2).mockResolvedValue({ id: 42 });

    await expect(deleteStaff(42)).resolves.toBe(42);
    expect(delete2).toHaveBeenCalledWith(42);
  });

  it('잘못된 삭제 응답을 거부하고 삭제 실패를 그대로 전달한다', async () => {
    vi.mocked(delete2).mockResolvedValue({ id: '42' } as never);
    await expect(deleteStaff(42)).rejects.toBeInstanceOf(ZodError);

    const error = new ApiError('STAFF_NOT_FOUND', 404);
    vi.mocked(delete2).mockRejectedValue(error);
    await expect(deleteStaff(42)).rejects.toBe(error);
  });

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

  it('재직 상태를 BE 값으로 바꿔 요청하고 응답을 FE 값으로 변환한다', async () => {
    vi.mocked(changeEmploymentStatus).mockResolvedValue({
      id: 42,
      employmentStatus: 'RESIGNED',
      updatedAt: STAFF.createdAt,
    });
    await expect(changeStaffEmploymentStatus(42, 'resigned')).resolves.toEqual({
      id: 42,
      employmentStatus: 'resigned',
    });
    expect(changeEmploymentStatus).toHaveBeenCalledWith(42, {
      employmentStatus: 'RESIGNED',
    });
  });

  it('잘못된 재직 상태 응답을 거부한다', async () => {
    vi.mocked(changeEmploymentStatus).mockResolvedValue({
      id: 42,
      employmentStatus: 'FIRED',
    } as never);
    await expect(
      changeStaffEmploymentStatus(42, 'onLeave'),
    ).rejects.toBeInstanceOf(ZodError);
    expect(changeEmploymentStatus).toHaveBeenCalledWith(42, {
      employmentStatus: 'ON_LEAVE',
    });
  });

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
      items: [{ id: 42, phone: null, employmentStatus: 'onLeave' }],
    });
  });

  it('선택 필드가 모두 비어 있는 상세를 변환한다', async () => {
    vi.mocked(findById1).mockResolvedValue(DETAIL);
    await expect(getStaffDetail(42)).resolves.toEqual({
      id: 42,
      name: STAFF.name,
      phone: null,
      createdAt: STAFF.createdAt,
      employmentStatus: 'onLeave',
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
