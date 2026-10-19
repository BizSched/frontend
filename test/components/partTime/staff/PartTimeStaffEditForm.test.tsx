import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { PartTimeStaffEditForm } from '@components/partTime/staff/PartTimeStaffEditForm';

import {
  staffDetailQueryOptions,
  staffKeys,
} from '@hooks/api/staff/staffQueryOptions';

import { ApiError, NetworkError } from '@lib/api/apiError';
import { getStaffDetail } from '@lib/api/entities/staff/api';
import type { PartTimeStaffDetailItem } from '@lib/types/partTimeStaff';

vi.mock('@lib/api/entities/staff/api', () => ({
  getStaffDetail: vi.fn(),
  getStaffList: vi.fn(),
}));
vi.mock('@components/partTime/staff/PartTimeStaffForm', () => ({
  PartTimeStaffForm: ({ staff }: { staff: PartTimeStaffDetailItem }) => {
    const [name, setName] = useState(staff.name);
    return (
      <input
        aria-label="이름"
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
    );
  },
}));

const STAFF: PartTimeStaffDetailItem = {
  id: 42,
  name: '김알바',
  createdAt: '2026-10-14T09:00:00+09:00',
  employmentStatus: 'employed',
  attachments: [],
};
const clients: QueryClient[] = [];
const renderForm = (isHydrated = true) => {
  const client = new QueryClient();
  clients.push(client);
  if (isHydrated) client.setQueryData(staffKeys.detail(42), STAFF);
  render(
    <QueryClientProvider client={client}>
      <PartTimeStaffEditForm staffId={42} />
    </QueryClientProvider>,
  );
  return client;
};

beforeEach(() => vi.resetAllMocks());
afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
});

describe('PartTimeStaffEditForm', () => {
  it.each([
    new ApiError('INVALID_REQUEST', 400),
    new ApiError('FORBIDDEN', 403),
    new Error('HTTP 500'),
    new NetworkError(),
  ])(
    '재조회 실패(%s)와 재시도 성공 후에도 미저장 입력을 유지한다',
    async (error) => {
      const client = renderForm();
      const input = screen.getByLabelText('이름');
      fireEvent.change(input, { target: { value: '미저장 이름' } });
      vi.mocked(getStaffDetail).mockRejectedValue(error);
      await act(async () => {
        await client
          .fetchQuery({
            ...staffDetailQueryOptions(42),
            staleTime: 0,
            retry: false,
          })
          .catch(() => undefined);
      });
      await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
      expect(screen.getByLabelText('이름')).toBe(input);
      expect((input as HTMLInputElement).value).toBe('미저장 이름');
      vi.mocked(getStaffDetail).mockResolvedValue(STAFF);
      fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
      await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
      expect(screen.getByLabelText('이름')).toBe(input);
      expect((input as HTMLInputElement).value).toBe('미저장 이름');
    },
  );

  it('초기 400 실패는 오류를 표시하고 재시도로 폼을 연다', async () => {
    vi.mocked(getStaffDetail).mockRejectedValue(
      new ApiError('INVALID_REQUEST', 400),
    );
    renderForm(false);
    await waitFor(() => expect(screen.getByRole('alert')).toBeTruthy());
    expect(screen.queryByLabelText('이름')).toBeNull();
    vi.mocked(getStaffDetail).mockResolvedValue(STAFF);
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.getByLabelText('이름')).toBeTruthy());
  });
});
