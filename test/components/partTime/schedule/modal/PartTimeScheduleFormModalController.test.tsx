import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Toaster, toast } from '@components/_common/Toast/Toaster';
import type { PartTimeScheduleFormModalProps } from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';
import { PartTimeScheduleFormModalController } from '@components/partTime/schedule/modal/PartTimeScheduleFormModalController';

import { ApiError } from '@lib/api/apiError';
import { createSchedule, updateSchedule } from '@lib/api/entities/schedule/api';
import { getAllStaffs } from '@lib/api/entities/staff/api';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

vi.mock('@lib/api/entities/staff/api', () => ({ getAllStaffs: vi.fn() }));
vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
}));
vi.mock('@hooks/overlay/useOverlayStackIndex', () => ({
  useOverlayStackIndex: () => 0,
}));
vi.mock(
  '@components/partTime/schedule/modal/PartTimeScheduleFormModal',
  () => ({
    PartTimeScheduleFormModal: ({
      staffs,
      staffPlaceholder,
      onSubmit,
      isPending,
    }: PartTimeScheduleFormModalProps) => (
      <div>
        <p data-testid="placeholder">{staffPlaceholder ?? '기본'}</p>
        <p data-testid="pending">{String(isPending)}</p>
        <button
          onClick={() =>
            void onSubmit({
              staffId: 1,
              date: '2026-10-14',
              startTime: '09:00',
              endTime: '13:00',
              memo: '',
            })
          }
        >
          제출
        </button>
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
  const close = vi.fn();
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeScheduleFormModalController
        overlayId="overlay"
        isOpen
        close={close}
        unmount={vi.fn()}
        mode={schedule ? 'edit' : 'create'}
        schedule={schedule}
      />
      <Toaster />
    </QueryClientProvider>,
  );
  return { close };
};

afterEach(() => {
  cleanup();
  toast.dismiss();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.resetAllMocks();
});

describe('PartTimeScheduleFormModalController', () => {
  it('등록 중에는 닫지 않고 성공 후에만 닫으며 중복 요청을 막는다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    let resolve!: (value: PartTimeSchedule) => void;
    vi.mocked(createSchedule).mockImplementation(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const { close } = renderController();
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    await waitFor(() =>
      expect(screen.getByTestId('pending').textContent).toBe('true'),
    );
    expect(close).not.toHaveBeenCalled();
    expect(createSchedule).toHaveBeenCalledTimes(1);
    expect(createSchedule).toHaveBeenCalledWith({
      staffId: 1,
      workDate: '2026-10-14',
      startTime: '09:00',
      endTime: '13:00',
      memo: '',
    });
    resolve(RESIGNED_SCHEDULE);
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  });

  it('수정은 변경된 필드와 빈 메모만 전송한다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(updateSchedule).mockResolvedValue(RESIGNED_SCHEDULE);
    const { close } = renderController({
      ...RESIGNED_SCHEDULE,
      staff: { id: 1, name: '김예림', isDeleted: false },
      startTime: '09:00',
      endTime: '13:00',
      memo: '삭제할 메모',
    });
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
    expect(updateSchedule).toHaveBeenCalledWith(10, { memo: '' });
  });

  it('변경된 값이 없으면 수정 요청을 보내지 않는다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    const { close } = renderController({
      ...RESIGNED_SCHEDULE,
      staff: { id: 1, name: '김예림', isDeleted: false },
      startTime: '09:00',
      endTime: '13:00',
    });
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(updateSchedule).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
  });

  it('시간 충돌 오류는 토스트로 알리고 다시 제출하면 이전 토스트를 지운다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(createSchedule)
      .mockRejectedValueOnce(
        new ApiError(
          'SCHEDULE_TIME_CONFLICT',
          409,
          '해당 시간대에 이미 스케줄이 존재합니다.',
        ),
      )
      .mockResolvedValue(RESIGNED_SCHEDULE);
    const { close } = renderController();
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    expect(
      await screen.findByText('해당 시간대에 이미 스케줄이 존재합니다.'),
    ).toBeTruthy();
    expect(close).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: '제출' }));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.queryByText('해당 시간대에 이미 스케줄이 존재합니다.'),
      ).toBeNull(),
    );
  });

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
