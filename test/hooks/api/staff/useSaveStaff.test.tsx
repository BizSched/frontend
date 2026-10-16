import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import { staffKeys } from '@hooks/api/staff/staffQueryOptions';
import { useSaveStaff } from '@hooks/api/staff/useSaveStaff';

import { ApiError, NetworkError } from '@lib/api/apiError';
import {
  createStaff,
  deleteStaffAttachment,
  getStaffDetail,
  updateStaff,
  uploadStaffAttachment,
} from '@lib/api/entities/staff/api';
import type {
  PartTimeStaffDetailItem,
  PartTimeStaffFormNewAttachment,
} from '@lib/types/partTimeStaff';
import { toPartTimeStaffFormValues } from '@lib/utilities/partTime/partTimeStaffForm';

vi.mock('@lib/api/entities/staff/api', () => ({
  createStaff: vi.fn(),
  deleteStaffAttachment: vi.fn(),
  getStaffDetail: vi.fn(),
  updateStaff: vi.fn(),
  uploadStaffAttachment: vi.fn(),
}));

const STAFF: PartTimeStaffDetailItem = {
  id: 42,
  name: '김알바',
  phone: '010-1234-5678',
  createdAt: '2026-10-14',
  employmentStatus: 'employed',
  memo: '이전 메모',
  attachments: [
    {
      id: 1,
      name: '기존.pdf',
      type: 'pdf',
      url: '/api/staff/42/attachments/1',
    },
  ],
};
const newAttachment = (key: string): PartTimeStaffFormNewAttachment => ({
  kind: 'new',
  key,
  name: `${key}.pdf`,
  url: `blob:${key}`,
  type: 'pdf',
  file: new File([key], `${key}.pdf`, { type: 'application/pdf' }),
});
const withUpload = (
  staff: PartTimeStaffDetailItem,
  key: string,
  id: number,
): PartTimeStaffDetailItem => ({
  ...staff,
  attachments: [
    ...staff.attachments,
    {
      id,
      name: `${key}.pdf`,
      type: 'pdf',
      url: `/api/staff/42/attachments/${id}`,
    },
  ],
});
const clients: QueryClient[] = [];
const setup = (staff?: PartTimeStaffDetailItem) => {
  const client = new QueryClient();
  clients.push(client);
  const keys = [
    staffKeys.list(),
    staffKeys.options(),
    staffKeys.options('EMPLOYED'),
    scheduleKeys.list({ from: '2026-10-01', to: '2026-10-31' }),
  ];
  keys.forEach((key) => client.setQueryData(key, []));
  const hook = renderHook(({ staff }) => useSaveStaff(staff), {
    initialProps: { staff },
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    ),
  });
  return { ...hook, client, keys };
};

beforeEach(() => vi.resetAllMocks());
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

describe('useSaveStaff', () => {
  it.each(['first', 'renamed'])(
    '새 첨부 ID가 여러 개면 파일명(%s)으로 추측하지 않고 재제출과 삭제를 막는다',
    async (uploadedName) => {
      const external = withUpload(STAFF, 'first', 2);
      vi.mocked(uploadStaffAttachment).mockResolvedValue(
        withUpload(external, uploadedName, 3),
      );
      const { result } = setup(STAFF);
      const values = {
        ...toPartTimeStaffFormValues(STAFF),
        attachments: [
          ...toPartTimeStaffFormValues(STAFF).attachments,
          newAttachment('first'),
          newAttachment('second'),
        ],
      };
      await act(async () => {
        await expect(result.current.mutateAsync(values)).rejects.toThrow(
          '업로드한 첨부파일 정보를 확인',
        );
      });
      await waitFor(() => expect(result.current.requiresReview).toBe(true));
      expect(result.current.reviewStaffId).toBe(42);
      await act(async () => {
        await expect(
          result.current.mutateAsync(toPartTimeStaffFormValues(STAFF)),
        ).rejects.toThrow('확인');
      });
      expect(deleteStaffAttachment).not.toHaveBeenCalled();
      expect(uploadStaffAttachment).toHaveBeenCalledTimes(1);
    },
  );

  it.each([new NetworkError(), new Error('HTTP 500')])(
    'PATCH 결과가 불명확한 뒤 입력을 원래 값으로 되돌려도 실제로 저장한다: %s',
    async (error) => {
      let server = STAFF;
      vi.mocked(updateStaff)
        .mockImplementationOnce(async () => {
          server = { ...STAFF, memo: '수정 메모' };
          throw error;
        })
        .mockImplementationOnce(async (_id, body) => {
          server = { ...server, memo: body.note };
          return server;
        });
      vi.mocked(getStaffDetail).mockImplementation(async () => server);
      const { result, rerender } = setup(STAFF);
      await act(async () => {
        await expect(
          result.current.mutateAsync({
            ...toPartTimeStaffFormValues(STAFF),
            memo: '수정 메모',
          }),
        ).rejects.toBe(error);
      });
      rerender({ staff: server });
      await act(async () => {
        await expect(
          result.current.mutateAsync(toPartTimeStaffFormValues(STAFF)),
        ).resolves.toMatchObject({
          isComplete: true,
          staff: { memo: STAFF.memo },
        });
      });
      expect(getStaffDetail).toHaveBeenCalledWith(42);
      expect(updateStaff).toHaveBeenLastCalledWith(42, { note: STAFF.memo });
      expect(server.memo).toBe(STAFF.memo);
    },
  );

  it('PATCH 결과 재조회가 실패하면 변경 요청 없이 입력을 유지하고 다음 제출에서 다시 조회한다', async () => {
    const error = new NetworkError();
    vi.mocked(updateStaff)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ ...STAFF, memo: '수정 메모' });
    vi.mocked(getStaffDetail)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(STAFF);
    const { result } = setup(STAFF);
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      memo: '수정 메모',
    };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBe(error);
    });
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBe(error);
    });
    expect(updateStaff).toHaveBeenCalledTimes(1);
    expect(deleteStaffAttachment).not.toHaveBeenCalled();
    expect(uploadStaffAttachment).not.toHaveBeenCalled();
    expect(result.current.requiresReview).toBe(false);
    await act(async () => {
      await expect(result.current.mutateAsync(values)).resolves.toMatchObject({
        isComplete: true,
      });
    });
    expect(getStaffDetail).toHaveBeenCalledTimes(2);
    expect(updateStaff).toHaveBeenCalledTimes(2);
  });

  it('응답이 유실된 PATCH가 이미 반영됐으면 재조회 결과로 완료하고 같은 변경을 반복하지 않는다', async () => {
    const saved = { ...STAFF, memo: '수정 메모' };
    vi.mocked(updateStaff).mockRejectedValue(new NetworkError());
    vi.mocked(getStaffDetail).mockResolvedValue(saved);
    const { result, client } = setup(STAFF);
    const values = toPartTimeStaffFormValues(saved);
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBeInstanceOf(
        NetworkError,
      );
    });
    await act(async () => {
      await expect(result.current.mutateAsync(values)).resolves.toEqual({
        staff: saved,
        isComplete: true,
      });
    });
    expect(updateStaff).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(staffKeys.detail(42))).toEqual(saved);
  });

  it('부분 실패 후 재시도에서도 다른 경로에서 추가된 첨부파일은 삭제하지 않는다', async () => {
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      memo: '',
      attachments: [newAttachment('first'), newAttachment('second')],
    };
    const external = withUpload(
      { ...STAFF, memo: '', attachments: [] },
      'external',
      99,
    );
    const first = withUpload(external, 'first', 2);
    vi.mocked(deleteStaffAttachment).mockResolvedValue(undefined);
    vi.mocked(updateStaff).mockResolvedValue(external);
    vi.mocked(uploadStaffAttachment)
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(new ApiError('INVALID', 400))
      .mockResolvedValueOnce(withUpload(first, 'second', 3));
    const { result } = setup(STAFF);
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBeInstanceOf(
        ApiError,
      );
    });
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(vi.mocked(deleteStaffAttachment).mock.calls).toEqual([[42, 1]]);
  });
  it.each([new NetworkError(), new Error('HTTP 500')])(
    '등록 결과가 불명확하면 목록 확인을 안내하고 재전송을 막는다: %s',
    async (error) => {
      vi.mocked(createStaff).mockRejectedValue(error);
      const { result } = setup();
      const values = { ...toPartTimeStaffFormValues(STAFF), attachments: [] };
      await act(async () => {
        await expect(result.current.mutateAsync(values)).rejects.toBe(error);
      });
      await waitFor(() => expect(result.current.requiresReview).toBe(true));
      expect(result.current.reviewStaffId).toBeUndefined();
      await act(async () => {
        await expect(result.current.mutateAsync(values)).rejects.toThrow(
          '확인',
        );
      });
      expect(createStaff).toHaveBeenCalledTimes(1);
    },
  );

  it('파일 추가 결과가 불명확하면 입력을 유지하고 직원 상세 확인 후 재개하도록 막는다', async () => {
    vi.mocked(uploadStaffAttachment).mockRejectedValue(new NetworkError());
    const { result } = setup(STAFF);
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      attachments: [
        ...toPartTimeStaffFormValues(STAFF).attachments,
        newAttachment('first'),
        newAttachment('second'),
      ],
    };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBeInstanceOf(
        NetworkError,
      );
    });
    await waitFor(() => expect(result.current.requiresReview).toBe(true));
    expect(result.current.reviewStaffId).toBe(42);
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toThrow('확인');
    });
    expect(uploadStaffAttachment).toHaveBeenCalledTimes(1);
  });

  it('BE가 파일명을 바꿔 저장해도 새로 생긴 첨부 ID로 업로드를 확인한다', async () => {
    const renamed = {
      ...STAFF,
      attachments: [
        ...STAFF.attachments,
        {
          id: 2,
          name: 'first(1).pdf',
          type: 'pdf' as const,
          url: '/api/staff/42/attachments/2',
        },
      ],
    };
    vi.mocked(uploadStaffAttachment).mockResolvedValue(renamed);
    vi.mocked(deleteStaffAttachment).mockResolvedValue(undefined);
    const { result } = setup(STAFF);
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      attachments: [
        ...toPartTimeStaffFormValues(STAFF).attachments,
        newAttachment('first'),
      ],
    };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).resolves.toMatchObject({
        isComplete: true,
        staff: renamed,
      });
    });
    expect(result.current.requiresReview).toBe(false);
    await act(async () => {
      await result.current.mutateAsync({
        ...values,
        attachments: toPartTimeStaffFormValues(STAFF).attachments,
      });
    });
    expect(vi.mocked(deleteStaffAttachment).mock.calls).toEqual([[42, 2]]);
    expect(uploadStaffAttachment).toHaveBeenCalledTimes(1);
  });

  it('일반 정보 PATCH의 응답 유실은 같은 값으로 안전하게 재시도한다', async () => {
    vi.mocked(updateStaff)
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValueOnce({ ...STAFF, memo: '' });
    vi.mocked(getStaffDetail).mockResolvedValue(STAFF);
    const { result } = setup(STAFF);
    const values = { ...toPartTimeStaffFormValues(STAFF), memo: '' };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBeInstanceOf(
        NetworkError,
      );
    });
    expect(result.current.requiresReview).toBe(false);
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(updateStaff).toHaveBeenCalledTimes(2);
  });
  it('등록 정보를 먼저 저장하고 파일을 하나씩 순서대로 올린다', async () => {
    const saved = { ...STAFF, attachments: [] };
    const first = withUpload(saved, 'first', 2);
    const second = withUpload(first, 'second', 3);
    const calls: string[] = [];
    vi.mocked(createStaff).mockImplementation(async () => {
      calls.push('create');
      return saved;
    });
    vi.mocked(uploadStaffAttachment).mockImplementation(async (_id, file) => {
      calls.push(file.name);
      return file.name === 'first.pdf' ? first : second;
    });
    const { result, client } = setup();
    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...toPartTimeStaffFormValues(STAFF),
          attachments: [newAttachment('first'), newAttachment('second')],
        }),
      ).resolves.toMatchObject({ isComplete: true, staff: second });
    });
    expect(calls).toEqual(['create', 'first.pdf', 'second.pdf']);
    expect(client.getQueryState(staffKeys.options())?.isInvalidated).toBe(true);
    expect(client.getQueryData(staffKeys.detail(42))).toEqual(second);
  });

  it('등록 후 업로드가 실패하면 생성된 ID와 부분 완료 결과를 반환한다', async () => {
    vi.mocked(createStaff).mockResolvedValue({ ...STAFF, attachments: [] });
    const error = new ApiError('VALIDATION_ERROR', 400, '파일을 확인해주세요.');
    vi.mocked(uploadStaffAttachment).mockRejectedValue(error);
    const { result, client } = setup();
    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...toPartTimeStaffFormValues(STAFF),
          attachments: [newAttachment('first'), newAttachment('second')],
        }),
      ).resolves.toMatchObject({ isComplete: false, staff: { id: 42 }, error });
    });
    expect(createStaff).toHaveBeenCalledTimes(1);
    expect(uploadStaffAttachment).toHaveBeenCalledTimes(1);
    expect(client.getQueryState(staffKeys.list())?.isInvalidated).toBe(true);
  });

  it('삭제→변경 정보 저장→파일 추가 순서를 지키고 이름 변경 시 스케쥴도 갱신한다', async () => {
    const calls: string[] = [];
    const changed = { ...STAFF, name: '박알바', memo: '', attachments: [] };
    vi.mocked(deleteStaffAttachment).mockImplementation(async () => {
      calls.push('delete');
    });
    vi.mocked(updateStaff).mockImplementation(async () => {
      calls.push('update');
      return changed;
    });
    vi.mocked(uploadStaffAttachment).mockImplementation(async () => {
      calls.push('upload');
      return withUpload(changed, 'new', 2);
    });
    const { result, client, keys } = setup(STAFF);
    await act(async () => {
      await result.current.mutateAsync({
        ...toPartTimeStaffFormValues(STAFF),
        name: ' 박알바 ',
        memo: '',
        attachments: [newAttachment('new')],
      });
    });
    expect(calls).toEqual(['delete', 'update', 'upload']);
    expect(updateStaff).toHaveBeenCalledWith(42, { name: '박알바', note: '' });
    keys.forEach((key) =>
      expect(client.getQueryState(key)?.isInvalidated).toBe(true),
    );
  });

  it('부분 실패 후에는 완료한 삭제·정보 수정·파일 업로드를 반복하지 않는다', async () => {
    const changed = { ...STAFF, memo: '수정 메모', attachments: [] };
    const first = withUpload(changed, 'first', 2);
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      memo: '수정 메모',
      attachments: [newAttachment('first'), newAttachment('second')],
    };
    const error = new ApiError('VALIDATION_ERROR', 400);
    vi.mocked(deleteStaffAttachment).mockResolvedValue(undefined);
    vi.mocked(updateStaff).mockResolvedValue(changed);
    vi.mocked(uploadStaffAttachment)
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(withUpload(first, 'second', 3));
    const { result, client } = setup(STAFF);
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBe(error);
    });
    expect(client.getQueryData(staffKeys.detail(42))).toEqual(first);
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(deleteStaffAttachment).toHaveBeenCalledTimes(1);
    expect(updateStaff).toHaveBeenCalledTimes(1);
    expect(uploadStaffAttachment).toHaveBeenCalledTimes(3);
    expect(
      vi.mocked(uploadStaffAttachment).mock.calls.map(([, file]) => file.name),
    ).toEqual(['first.pdf', 'second.pdf', 'second.pdf']);
  });

  it('부분 성공한 신규 파일을 폼에서 제거하면 재제출 때 서버에서도 삭제한다', async () => {
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      attachments: [newAttachment('first'), newAttachment('second')],
    };
    const first = withUpload({ ...STAFF, attachments: [] }, 'first', 2);
    vi.mocked(deleteStaffAttachment).mockResolvedValue(undefined);
    vi.mocked(uploadStaffAttachment)
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(new ApiError('INVALID', 400))
      .mockResolvedValueOnce(
        withUpload({ ...STAFF, attachments: [] }, 'second', 3),
      );
    const { result } = setup(STAFF);
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBeInstanceOf(
        ApiError,
      );
    });
    await act(async () => {
      await result.current.mutateAsync({
        ...values,
        attachments: [values.attachments[1]],
      });
    });
    expect(vi.mocked(deleteStaffAttachment).mock.calls).toEqual([
      [42, 1],
      [42, 2],
    ]);
    expect(updateStaff).not.toHaveBeenCalled();
  });

  it('삭제 404는 완료로 취급하고 다음 요청을 진행한다', async () => {
    vi.mocked(deleteStaffAttachment).mockRejectedValue(
      new ApiError('ATTACHMENT_NOT_FOUND', 404),
    );
    vi.mocked(updateStaff).mockResolvedValue({
      ...STAFF,
      memo: '',
      attachments: [],
    });
    const { result } = setup(STAFF);
    await act(async () => {
      await result.current.mutateAsync({
        ...toPartTimeStaffFormValues(STAFF),
        memo: '',
        attachments: [],
      });
    });
    expect(updateStaff).toHaveBeenCalledWith(42, { note: '' });
  });

  it('삭제 실패 시 후속 요청을 보내지 않고 같은 입력으로 재시도할 수 있다', async () => {
    const error = new ApiError('FORBIDDEN', 403);
    vi.mocked(deleteStaffAttachment)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);
    vi.mocked(updateStaff).mockResolvedValue({
      ...STAFF,
      memo: '',
      attachments: [],
    });
    const { result } = setup(STAFF);
    const values = {
      ...toPartTimeStaffFormValues(STAFF),
      memo: '',
      attachments: [],
    };
    await act(async () => {
      await expect(result.current.mutateAsync(values)).rejects.toBe(error);
    });
    expect(updateStaff).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.mutateAsync(values);
    });
    expect(deleteStaffAttachment).toHaveBeenCalledTimes(2);
    expect(updateStaff).toHaveBeenCalledTimes(1);
  });

  it('이름이 그대로면 스케쥴 캐시를 무효화하지 않는다', async () => {
    vi.mocked(updateStaff).mockResolvedValue({ ...STAFF, memo: '' });
    const { result, client, keys } = setup(STAFF);
    await act(async () => {
      await result.current.mutateAsync({
        ...toPartTimeStaffFormValues(STAFF),
        memo: '',
      });
    });
    expect(client.getQueryState(keys[3])?.isInvalidated).toBe(false);
  });

  it('선택값 삭제와 10개 초과는 서버를 변경하기 전에 막는다', async () => {
    const { result } = setup({ ...STAFF, hourlyWage: 10000 });
    await act(async () => {
      await expect(
        result.current.mutateAsync(toPartTimeStaffFormValues(STAFF)),
      ).rejects.toThrow('기존 값');
    });
    await act(async () => {
      await expect(
        result.current.mutateAsync({
          ...toPartTimeStaffFormValues(STAFF),
          attachments: Array.from({ length: 11 }, (_, index) =>
            newAttachment(String(index)),
          ),
        }),
      ).rejects.toThrow('10개');
    });
    expect(deleteStaffAttachment).not.toHaveBeenCalled();
    expect(updateStaff).not.toHaveBeenCalled();
  });

  it('동시에 제출해도 등록 요청은 한 번만 보낸다', async () => {
    let resolve!: (staff: PartTimeStaffDetailItem) => void;
    vi.mocked(createStaff).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { result } = setup();
    await act(async () => {
      const first = result.current.mutateAsync({
        ...toPartTimeStaffFormValues(STAFF),
        attachments: [],
      });
      const second = result.current.mutateAsync({
        ...toPartTimeStaffFormValues(STAFF),
        attachments: [],
      });
      await Promise.resolve();
      await Promise.resolve();
      resolve({ ...STAFF, attachments: [] });
      await Promise.all([first, second]);
    });
    expect(createStaff).toHaveBeenCalledTimes(1);
  });
});
