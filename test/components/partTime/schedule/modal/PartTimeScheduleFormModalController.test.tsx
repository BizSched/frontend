import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { PartTimeScheduleFormModalProps } from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';
import { PartTimeScheduleFormModalController } from '@components/partTime/schedule/modal/PartTimeScheduleFormModalController';

import { ApiError } from '@lib/api/apiError';
import { getAllStaffs } from '@lib/api/entities/staff/api';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

vi.mock('@lib/api/entities/staff/api', () => ({ getAllStaffs: vi.fn() }));
vi.mock('@hooks/overlay/useOverlayStackIndex', () => ({
  useOverlayStackIndex: () => 0,
}));
vi.mock(
  '@components/partTime/schedule/modal/PartTimeScheduleFormModal',
  () => ({
    PartTimeScheduleFormModal: ({
      staffs,
      staffPlaceholder,
    }: PartTimeScheduleFormModalProps) => (
      <div>
        <p data-testid="placeholder">{staffPlaceholder ?? '기본'}</p>
        <ul>
          {staffs.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
      </div>
    ),
  }),
);

const RESIGNED_SCHEDULE: PartTimeSchedule = {
  id: 10,
  staff: { id: 99, name: '퇴사한알바', isDeleted: false },
  date: '2026-10-14',
  startTime: '15:00',
  endTime: '19:00',
  isCheckedIn: true,
  memo: '',
};

const clients: QueryClient[] = [];
const renderController = (schedule?: PartTimeSchedule) => {
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeScheduleFormModalController
        overlayId="overlay"
        isOpen
        close={vi.fn()}
        unmount={vi.fn()}
        mode={schedule ? 'edit' : 'create'}
        schedule={schedule}
      />
    </QueryClientProvider>,
  );
};

afterEach(() => {
  cleanup();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.resetAllMocks();
});

describe('PartTimeScheduleFormModalController', () => {
  it('재직자만 옵션으로 받는다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([
      { id: 1, name: '김예림', isDeleted: false },
    ]);
    renderController();

    expect(screen.getByTestId('placeholder').textContent).toBe(
      '아르바이트생 목록을 불러오는 중이에요',
    );
    await waitFor(() => expect(screen.getByText('김예림')).toBeTruthy());
    expect(getAllStaffs).toHaveBeenCalledWith('EMPLOYED', expect.anything());
    expect(screen.getByTestId('placeholder').textContent).toBe('기본');
  });

  it('수정 모드는 목록을 받는 중에도 현재 담당자를 옵션에 둔다', () => {
    vi.mocked(getAllStaffs).mockImplementation(() => new Promise(() => {}));
    renderController(RESIGNED_SCHEDULE);

    expect(screen.getByText('퇴사한알바')).toBeTruthy();
  });

  it('휴직·퇴사자의 지난 근무를 수정할 때 담당자를 재직자 목록 앞에 둔다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([
      { id: 1, name: '김예림', isDeleted: false },
    ]);
    renderController(RESIGNED_SCHEDULE);

    await waitFor(() => expect(screen.getByText('김예림')).toBeTruthy());
    expect(
      screen.getAllByRole('listitem').map(({ textContent }) => textContent),
    ).toEqual(['퇴사한알바', '김예림']);
  });

  it.each([
    {
      name: '조회 실패',
      mock: () =>
        vi.mocked(getAllStaffs).mockRejectedValue(new ApiError('BAD', 400)),
      text: '아르바이트생 목록을 불러오지 못했어요',
    },
    {
      name: '재직자 없음',
      mock: () => vi.mocked(getAllStaffs).mockResolvedValue([]),
      text: '재직 중인 아르바이트생이 없어요',
    },
  ])(
    '추가 모드의 $name 상태를 placeholder로 알린다',
    async ({ mock, text }) => {
      mock();
      renderController();

      await waitFor(() =>
        expect(screen.getByTestId('placeholder').textContent).toBe(text),
      );
    },
  );
});
