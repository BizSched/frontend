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
  await waitFor(() =>
    expect(screen.getByTitle('계약서.pdf').getAttribute('src')).toBe(
      'blob:authenticated-pdf',
    ),
  );
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
  vi.mocked(getStaffAttachment).mockResolvedValue(new Blob(['%PDF']));
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  await waitFor(() => expect(screen.getByTitle('계약서.pdf')).toBeTruthy());
  expect(screen.queryByRole('alert')).toBeNull();
});
