import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { StrictMode, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useStaffAttachmentPreview } from '@hooks/api/staff/useStaffAttachmentPreview';

import { ApiError } from '@lib/api/apiError';
import { getStaffAttachment } from '@lib/api/entities/staff/api';

vi.mock('@lib/api/entities/staff/api', () => ({
  getStaffAttachment: vi.fn(),
  getStaffDetail: vi.fn(),
  getStaffList: vi.fn(),
}));

const createObjectURL = vi.fn();
const revokeObjectURL = vi.fn();
const clients: QueryClient[] = [];
const renderPreview = (url: string) => {
  const client = new QueryClient();
  clients.push(client);
  return renderHook(({ url }) => useStaffAttachmentPreview(url), {
    initialProps: { url },
    wrapper: ({ children }: { children: ReactNode }) => (
      <StrictMode>
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
      </StrictMode>
    ),
  });
};

beforeEach(() => {
  vi.resetAllMocks();
  let count = 0;
  createObjectURL.mockImplementation(() => `blob:preview-${++count}`);
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = createObjectURL;
      static revokeObjectURL = revokeObjectURL;
    },
  );
});
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.unstubAllGlobals();
});

describe('useStaffAttachmentPreview', () => {
  it('새 업로드의 Blob URL은 요청하거나 해제하지 않는다', () => {
    const { result, unmount } = renderPreview('blob:local-upload');
    expect(result.current.previewUrl).toBe('blob:local-upload');
    unmount();
    expect(getStaffAttachment).not.toHaveBeenCalled();
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(revokeObjectURL).not.toHaveBeenCalled();
  });

  it('파일 교체와 닫기 때 생성한 URL을 해제하고 이전 파일을 표시하지 않는다', async () => {
    const first = new Blob(['first'], { type: 'application/pdf' });
    const second = new Blob(['second'], { type: 'image/png' });
    vi.mocked(getStaffAttachment)
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second);
    const { result, rerender, unmount } = renderPreview(
      '/api/staff/42/attachments/3',
    );
    await waitFor(() => expect(result.current.previewUrl).toBeTruthy());
    const firstUrl = result.current.previewUrl;
    rerender({ url: '/api/staff/42/attachments/4' });
    expect(result.current.previewUrl).toBeUndefined();
    await waitFor(() => expect(result.current.previewUrl).toBeTruthy());
    expect(result.current.previewUrl).not.toBe(firstUrl);
    expect(revokeObjectURL).toHaveBeenCalledWith(firstUrl);
    unmount();
    expect(revokeObjectURL.mock.calls.map(([url]) => url).sort()).toEqual(
      createObjectURL.mock.results.map(({ value }) => value).sort(),
    );
  });

  it('첨부파일 오류를 재시도해 미리보기를 복구한다', async () => {
    vi.mocked(getStaffAttachment).mockRejectedValueOnce(
      new ApiError('NOT_FOUND', 404),
    );
    const { result } = renderPreview('/api/staff/42/attachments/3');
    await waitFor(() => expect(result.current.error).toBeTruthy());
    expect(result.current.previewUrl).toBeUndefined();
    vi.mocked(getStaffAttachment).mockResolvedValue(new Blob(['file']));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => expect(result.current.previewUrl).toBeTruthy());
    expect(result.current.error).toBeNull();
  });

  it('닫은 후 늦게 끝난 요청으로 URL을 만들지 않는다', async () => {
    let resolveAttachment!: (blob: Blob) => void;
    vi.mocked(getStaffAttachment).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAttachment = resolve;
        }),
    );
    const { unmount } = renderPreview('/api/staff/42/attachments/3');
    unmount();
    await act(async () => {
      resolveAttachment(new Blob(['late']));
    });
    expect(createObjectURL).not.toHaveBeenCalled();
  });
});
