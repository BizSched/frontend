import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PartTimeStaffAttachmentUploadModal } from '@components/partTime/staff/PartTimeStaffAttachmentUploadModal';

import { preparePartTimeStaffAttachment } from '@lib/utilities/partTime/preparePartTimeStaffAttachment';

vi.mock('@lib/utilities/partTime/preparePartTimeStaffAttachment', () => ({
  preparePartTimeStaffAttachment: vi.fn(),
}));

const setup = () => {
  const onUpload = vi.fn();
  const onOpenChange = vi.fn();
  const rendered = render(
    <PartTimeStaffAttachmentUploadModal
      open
      onUpload={onUpload}
      onOpenChange={onOpenChange}
    />,
  );
  const select = (file: File) =>
    fireEvent.change(document.querySelector('input[type="file"]')!, {
      target: { files: [file] },
    });
  return { ...rendered, onUpload, onOpenChange, select };
};
const pdf = (name: string) =>
  new File(['pdf'], name, { type: 'application/pdf' });

beforeEach(() => vi.resetAllMocks());
afterEach(cleanup);

describe('PartTimeStaffAttachmentUploadModal', () => {
  it('전처리가 끝난 파일만 폼에 전달한다', async () => {
    const source = new File(['png'], '사진.png', { type: 'image/png' });
    const prepared = new File(['jpeg'], '사진.jpg', { type: 'image/jpeg' });
    let resolve!: (file: File) => void;
    vi.mocked(preparePartTimeStaffAttachment).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { select, onUpload } = setup();
    expect(
      document.querySelector('input[type="file"]')?.getAttribute('accept'),
    ).toBe('.jpg,.jpeg,.png,.webp,.pdf');
    select(source);
    expect(screen.getByRole('status')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '업로드' }));
    expect(onUpload).not.toHaveBeenCalled();
    await act(async () => resolve(prepared));
    fireEvent.click(screen.getByRole('button', { name: '업로드' }));
    expect(onUpload).toHaveBeenCalledWith(prepared);
  });

  it('큰 PDF 오류를 인라인으로 알리고 이전 선택을 유지한다', async () => {
    const previous = pdf('이전.pdf');
    vi.mocked(preparePartTimeStaffAttachment)
      .mockResolvedValueOnce(previous)
      .mockRejectedValueOnce(new Error('3.5MB 이하 파일만 올릴 수 있어요.'));
    const { select, onUpload } = setup();
    select(previous);
    await screen.findByText('이전.pdf');
    select(pdf('큰파일.pdf'));
    await waitFor(() =>
      expect(screen.getByRole('alert').textContent).toBe(
        '3.5MB 이하 파일만 올릴 수 있어요.',
      ),
    );
    fireEvent.click(screen.getByRole('button', { name: '업로드' }));
    expect(onUpload).toHaveBeenCalledWith(previous);
  });

  it('새 선택이 끝난 뒤 도착한 이전 처리 결과를 무시한다', async () => {
    const first = pdf('첫파일.pdf');
    const second = pdf('둘째파일.pdf');
    let resolveFirst!: (file: File) => void;
    vi.mocked(preparePartTimeStaffAttachment)
      .mockReturnValueOnce(
        new Promise((done) => {
          resolveFirst = done;
        }),
      )
      .mockResolvedValueOnce(second);
    const { select, onUpload } = setup();
    select(first);
    select(second);
    await screen.findByText('둘째파일.pdf');
    await act(async () => resolveFirst(first));
    expect(screen.queryByText('첫파일.pdf')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '업로드' }));
    expect(onUpload).toHaveBeenCalledWith(second);
  });

  it('닫은 뒤 도착한 처리 결과로 파일을 선택하지 않는다', async () => {
    let resolve!: (file: File) => void;
    vi.mocked(preparePartTimeStaffAttachment).mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    const { select, onUpload, onOpenChange, unmount } = setup();
    select(pdf('처리중.pdf'));
    fireEvent.click(screen.getByRole('button', { name: /닫기/ }));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    unmount();
    await act(async () => resolve(pdf('처리중.pdf')));
    expect(onUpload).not.toHaveBeenCalled();
  });
});
