import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast } from '@components/_common/Toast/Toaster';
import { openPartTimeStaffAttachmentUploadModal } from '@components/partTime/staff/openPartTimeStaffAttachmentUploadModal';
import { PartTimeStaffForm } from '@components/partTime/staff/PartTimeStaffForm';

import { ApiError, NetworkError } from '@lib/api/apiError';
import {
  createStaff,
  updateStaff,
  uploadStaffAttachment,
} from '@lib/api/entities/staff/api';
import type { PartTimeStaffDetailItem } from '@lib/types/partTimeStaff';

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@lib/api/entities/staff/api', () => ({
  createStaff: vi.fn(),
  updateStaff: vi.fn(),
  uploadStaffAttachment: vi.fn(),
  deleteStaffAttachment: vi.fn(),
}));
vi.mock(
  '@components/partTime/staff/openPartTimeStaffAttachmentUploadModal',
  () => ({ openPartTimeStaffAttachmentUploadModal: vi.fn() }),
);

const STAFF: PartTimeStaffDetailItem = {
  id: 42,
  name: '김알바',
  phone: '010-1234-5678',
  createdAt: '2026-10-16',
  employmentStatus: 'employed',
  memo: '원본',
  attachments: [],
};
const clients: QueryClient[] = [];
const renderForm = (staff?: PartTimeStaffDetailItem) => {
  const client = new QueryClient();
  clients.push(client);
  return render(
    <QueryClientProvider client={client}>
      <PartTimeStaffForm staff={staff} />
      <Toaster />
    </QueryClientProvider>,
  );
};
const fillRequired = () => {
  fireEvent.change(screen.getByLabelText('아르바이트생 이름'), {
    target: { value: '김알바' },
  });
  fireEvent.change(screen.getByLabelText('번호'), {
    target: { value: '01012345678' },
  });
};
const submitButton = () =>
  screen.getByRole('button', {
    name: /등록하기|수정하기/,
  }) as HTMLButtonElement;
const isSubmitDisabled = () =>
  submitButton().getAttribute('aria-disabled') === 'true';

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn((file: File) => `blob:${file.name}`);
      static revokeObjectURL = vi.fn();
    },
  );
});
afterEach(() => {
  cleanup();
  toast.dismiss();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.unstubAllGlobals();
});

describe('PartTimeStaffForm 저장', () => {
  it('등록 응답의 ID로 상세를 열고 저장 중 중복 제출과 입력 변경을 막는다', async () => {
    let resolve!: (staff: PartTimeStaffDetailItem) => void;
    vi.mocked(createStaff).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    renderForm();
    fillRequired();
    await waitFor(() => expect(isSubmitDisabled()).toBe(false));
    fireEvent.click(submitButton());
    await waitFor(() => expect(createStaff).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(isSubmitDisabled()).toBe(true));
    expect(screen.getByLabelText('메모').closest('fieldset')?.disabled).toBe(
      true,
    );
    fireEvent.click(submitButton());
    await act(async () => resolve(STAFF));
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/partTime/staff?staffId=42'),
    );
    expect(createStaff).toHaveBeenCalledTimes(1);
  });

  it('BE 거절은 토스트로 알리고 입력을 유지한 채 재제출한다', async () => {
    vi.mocked(updateStaff)
      .mockRejectedValueOnce(
        new ApiError('INVALID', 400, '입력값을 확인해주세요.'),
      )
      .mockResolvedValueOnce({ ...STAFF, memo: '변경' });
    renderForm(STAFF);
    fireEvent.change(screen.getByLabelText('메모'), {
      target: { value: '변경' },
    });
    await waitFor(() => expect(isSubmitDisabled()).toBe(false));
    fireEvent.click(submitButton());
    expect(await screen.findByText('입력값을 확인해주세요.')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect((screen.getByLabelText('메모') as HTMLTextAreaElement).value).toBe(
      '변경',
    );
    expect(replace).not.toHaveBeenCalled();
    fireEvent.click(submitButton());
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith('/partTime/staff?staffId=42'),
    );
    await waitFor(() =>
      expect(screen.queryByText('입력값을 확인해주세요.')).toBeNull(),
    );
  });

  it('등록 후 파일 실패는 이미 생성된 직원의 수정 페이지로 이동한다', async () => {
    vi.mocked(createStaff).mockResolvedValue(STAFF);
    vi.mocked(uploadStaffAttachment).mockRejectedValue(
      new ApiError('INVALID_FILE', 400, '파일을 확인해주세요.'),
    );
    vi.mocked(openPartTimeStaffAttachmentUploadModal).mockResolvedValue(
      new File(['pdf'], '계약서.pdf', { type: 'application/pdf' }),
    );
    renderForm();
    fillRequired();
    fireEvent.click(screen.getByRole('button', { name: '첨부파일 업로드' }));
    await screen.findByRole('button', { name: '계약서.pdf 삭제' });
    await waitFor(() => expect(isSubmitDisabled()).toBe(false));
    fireEvent.click(submitButton());
    await waitFor(() =>
      expect(replace).toHaveBeenCalledWith(
        '/partTime/staff/42/edit?uploadFailed=1',
      ),
    );
  });

  it('등록 결과 유실 시 재제출을 막고 목록 확인 링크를 표시한다', async () => {
    vi.mocked(createStaff).mockRejectedValue(new NetworkError());
    renderForm();
    fillRequired();
    await waitFor(() => expect(isSubmitDisabled()).toBe(false));
    fireEvent.click(submitButton());
    const link = await screen.findByRole('link', {
      name: '저장된 내용 확인하기',
    });
    expect(link.getAttribute('href')).toBe('/partTime/staff');
    expect(isSubmitDisabled()).toBe(true);
    expect(
      (screen.getByLabelText('아르바이트생 이름') as HTMLInputElement).value,
    ).toBe('김알바');
  });

  it('미확정인 기존 선택값 삭제를 막고 이유를 표시한다', async () => {
    renderForm({ ...STAFF, hourlyWage: 10000 });
    fireEvent.change(screen.getByLabelText('시급'), { target: { value: '' } });
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toContain('기존 값을 유지'),
    );
    expect(isSubmitDisabled()).toBe(true);
    expect(updateStaff).not.toHaveBeenCalled();
  });

  it('메모를 UTF-16 500자로 제한하고 한글 조합이 끝난 후 자른다', async () => {
    renderForm();
    const memo = screen.getByLabelText('메모') as HTMLTextAreaElement;
    fireEvent.change(memo, { target: { value: '😀'.repeat(251) } });
    await waitFor(() => expect(memo.value).toBe('😀'.repeat(250)));
    fireEvent.compositionStart(memo);
    fireEvent.input(memo, {
      target: { value: '가'.repeat(501) },
      isComposing: true,
    });
    expect(memo.value).toBe('가'.repeat(501));
    fireEvent.compositionEnd(memo);
    await waitFor(() => expect(memo.value).toBe('가'.repeat(500)));
  });

  it('첨부파일 10개에서는 추가를 막고 로컬 파일은 제거할 때 해제한다', async () => {
    renderForm({
      ...STAFF,
      attachments: Array.from({ length: 10 }, (_, index) => ({
        id: index,
        name: `${index}.pdf`,
        type: 'pdf',
        url: `/api/staff/42/attachments/${index}`,
      })),
    });
    expect(
      (
        screen.getByRole('button', {
          name: '첨부파일 업로드',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: '0.pdf 삭제' }));
    expect(
      (
        screen.getByRole('button', {
          name: '첨부파일 업로드',
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false);
    vi.mocked(openPartTimeStaffAttachmentUploadModal).mockResolvedValue(
      new File(['pdf'], '새파일.pdf', { type: 'application/pdf' }),
    );
    fireEvent.click(screen.getByRole('button', { name: '첨부파일 업로드' }));
    const remove = await screen.findByRole('button', {
      name: '새파일.pdf 삭제',
    });
    fireEvent.click(remove);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:새파일.pdf');
  });
});
