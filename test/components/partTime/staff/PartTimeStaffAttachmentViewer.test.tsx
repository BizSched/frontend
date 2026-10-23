import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';

import { PartTimeStaffAttachmentViewer } from '@components/partTime/staff/PartTimeStaffAttachmentViewer';

import { ApiError } from '@lib/api/apiError';
import { getStaffAttachment } from '@lib/api/entities/staff/api';

vi.mock('@lib/api/entities/staff/api', () => ({
  getStaffAttachment: vi.fn(),
  getStaffDetail: vi.fn(),
  getStaffList: vi.fn(),
}));
vi.mock('@assets/icons/ic_chevron-left-dark.svg', () => ({
  default: '/chevron.svg',
}));

const clients: QueryClient[] = [];
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn(() => 'blob:authenticated-pdf');
      static revokeObjectURL = vi.fn();
    },
  );
});
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.unstubAllGlobals();
});

it('저장된 WebP도 인증 조회 후 Blob URL로 이미지를 미리보기한다', async () => {
  vi.mocked(URL.createObjectURL).mockReturnValue('blob:authenticated-webp');
  vi.mocked(getStaffAttachment).mockResolvedValue(
    new Blob(['webp'], { type: 'image/webp' }),
  );
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeStaffAttachmentViewer
        attachment={{
          name: '사진.webp',
          type: 'image',
          url: '/api/staff/42/attachments/7',
        }}
        isCollapsed={false}
        onCollapsedChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
  const image = await screen.findByRole('img', { name: '사진.webp' });
  expect(image.getAttribute('src')).toBe('blob:authenticated-webp');
  const download = screen.getByRole('link', { name: '다운로드' });
  expect(download.getAttribute('href')).toBe('blob:authenticated-webp');
  expect(download.getAttribute('download')).toBe('사진.webp');
  expect(getStaffAttachment).toHaveBeenCalledWith(
    '/api/staff/42/attachments/7',
    expect.anything(),
  );
});

it('저장된 PDF는 요청이 끝난 뒤 Blob URL을 iframe에 전달한다', async () => {
  vi.mocked(getStaffAttachment).mockResolvedValue(
    new Blob(['%PDF'], { type: 'application/pdf' }),
  );
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeStaffAttachmentViewer
        attachment={{
          name: '계약서.pdf',
          type: 'pdf',
          url: '/api/staff/42/attachments/3',
        }}
        isCollapsed={false}
        onCollapsedChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
  expect(screen.getByRole('status')).toBeTruthy();
  expect(screen.queryByTitle('계약서.pdf')).toBeNull();
  expect(screen.queryByRole('link', { name: '다운로드' })).toBeNull();
  await waitFor(() =>
    expect(screen.getByTitle('계약서.pdf').getAttribute('src')).toBe(
      'blob:authenticated-pdf',
    ),
  );
  const download = screen.getByRole('link', { name: '다운로드' });
  expect(download.getAttribute('href')).toBe('blob:authenticated-pdf');
  expect(download.getAttribute('download')).toBe('계약서.pdf');
  expect(getStaffAttachment).toHaveBeenCalledTimes(1);
});

it('파일 조회 오류에서 다시 시도 버튼으로 미리보기를 복구한다', async () => {
  vi.mocked(getStaffAttachment).mockRejectedValueOnce(
    new ApiError('NOT_FOUND', 404),
  );
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeStaffAttachmentViewer
        attachment={{
          name: '계약서.pdf',
          type: 'pdf',
          url: '/api/staff/42/attachments/3',
        }}
        isCollapsed={false}
        onCollapsedChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
  await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
  expect(screen.queryByTitle('계약서.pdf')).toBeNull();
  expect(screen.queryByRole('link', { name: '다운로드' })).toBeNull();
  vi.mocked(getStaffAttachment).mockResolvedValue(new Blob(['%PDF']));
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  await waitFor(() => expect(screen.getByTitle('계약서.pdf')).toBeTruthy());
  expect(screen.queryByRole('alert')).toBeNull();
  expect(screen.getByRole('link', { name: '다운로드' })).toBeTruthy();
});

it('새로 선택한 로컬 파일은 서버 요청 없이 준비된 파일명으로 다운로드한다', () => {
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeStaffAttachmentViewer
        attachment={{
          name: '신분증.webp',
          type: 'image',
          url: 'blob:local-prepared-image',
        }}
        isCollapsed={false}
        onCollapsedChange={vi.fn()}
      />
    </QueryClientProvider>,
  );
  const download = screen.getByRole('link', { name: '다운로드' });
  expect(download.getAttribute('href')).toBe('blob:local-prepared-image');
  expect(download.getAttribute('download')).toBe('신분증.webp');
  expect(getStaffAttachment).not.toHaveBeenCalled();
});

it('파일을 바꾸면 다운로드 대상과 파일명을 교체하고 이전 URL을 해제한다', async () => {
  vi.mocked(URL.createObjectURL)
    .mockReturnValueOnce('blob:first-file')
    .mockReturnValueOnce('blob:second-file');
  vi.mocked(getStaffAttachment).mockResolvedValue(
    new Blob(['pdf'], { type: 'application/pdf' }),
  );
  const client = new QueryClient();
  clients.push(client);
  const renderViewer = (id: number, name: string) => (
    <QueryClientProvider client={client}>
      <PartTimeStaffAttachmentViewer
        attachment={{
          name,
          type: 'pdf',
          url: `/api/staff/42/attachments/${id}`,
        }}
        isCollapsed={false}
        onCollapsedChange={vi.fn()}
      />
    </QueryClientProvider>
  );
  const { rerender, unmount } = render(renderViewer(1, '이전.pdf'));
  const firstDownload = await screen.findByRole('link', { name: '다운로드' });
  expect(firstDownload.getAttribute('href')).toBe('blob:first-file');
  rerender(renderViewer(2, '다음.pdf'));
  await waitFor(() => {
    const download = screen.getByRole('link', { name: '다운로드' });
    expect(download.getAttribute('href')).toBe('blob:second-file');
    expect(download.getAttribute('download')).toBe('다음.pdf');
  });
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:first-file');
  unmount();
  expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:second-file');
});
