import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  Calendar,
  type CalendarProps,
} from '@components/_common/Calendar/Calendar';
import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { Toaster, toast } from '@components/_common/Toast/Toaster';
import { PartTimeScheduleActionButtons } from '@components/partTime/schedule/PartTimeScheduleActionButtons';
import { PartTimeScheduleCalendar } from '@components/partTime/schedule/PartTimeScheduleCalendar';
import type { PartTimeScheduleDaySummaryProps } from '@components/partTime/schedule/PartTimeScheduleDaySummary';
import { PartTimeScheduleImageSaveButton } from '@components/partTime/schedule/PartTimeScheduleImageSaveButton';
import type { PartTimeScheduleStaffFilterProps } from '@components/partTime/schedule/PartTimeScheduleStaffFilter';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';
import { usePartTimeScheduleImage } from '@hooks/partTime/usePartTimeScheduleImage';

import { PartTimeScheduleImageProvider } from '@providers/partTime/PartTimeScheduleImageProvider';

import { ApiError } from '@lib/api/apiError';
import {
  changeScheduleAttendance,
  deleteSchedule,
  getScheduleList,
} from '@lib/api/entities/schedule/api';
import { getAllStaffs } from '@lib/api/entities/staff/api';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';
import { captureElementImage } from '@lib/utilities/capture/captureElementImage';
import { downloadBlob } from '@lib/utilities/capture/downloadBlob';

vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(),
  deleteSchedule: vi.fn(),
  changeScheduleAttendance: vi.fn(),
}));
vi.mock('@components/_common/Modal/openConfirmModal', () => ({
  openConfirmModal: vi.fn(),
}));
vi.mock('@lib/api/entities/staff/api', () => ({ getAllStaffs: vi.fn() }));
vi.mock('@components/_common/Calendar/Calendar', () => ({
  Calendar: vi.fn(
    ({ headerSlot, onDateChange, onMonthChange, month }: CalendarProps) => (
      <section aria-label="캘린더">
        {headerSlot}
        <p data-testid="displayed-month">{month}</p>
        {[
          '2026-09-30',
          '2026-10-01',
          '2026-10-15',
          '2026-10-30',
          '2026-11-01',
          '2026-12-15',
        ].map((date) => (
          <button
            key={date}
            onClick={() => {
              onDateChange(date);
              if (date.slice(0, 7) !== month) onMonthChange(date.slice(0, 7));
            }}
          >
            선택 {date}
          </button>
        ))}
        {['2026-09', '2026-11', '2026-12'].map((nextMonth) => (
          <button key={nextMonth} onClick={() => onMonthChange(nextMonth)}>
            이동 {nextMonth}
          </button>
        ))}
      </section>
    ),
  ),
}));
vi.mock('@components/partTime/schedule/PartTimeScheduleDaySummary', () => ({
  PartTimeScheduleDaySummary: ({
    schedules,
    onScheduleDelete,
    onAttendanceChange,
    isPending,
    date,
  }: PartTimeScheduleDaySummaryProps) => (
    <div>
      <p data-testid="selected-date">{date}</p>
      {schedules.map((schedule) => (
        <div key={schedule.id}>
          <span data-testid="summary-staff">{schedule.staff.name}</span>
          <button
            disabled={isPending}
            onClick={() => onScheduleDelete(schedule)}
          >
            삭제
          </button>
          <button
            disabled={isPending}
            onClick={() => onAttendanceChange(schedule, !schedule.isCheckedIn)}
          >
            출근 변경
          </button>
          <span>{schedule.isCheckedIn ? '출근' : '미확인'}</span>
        </div>
      ))}
    </div>
  ),
}));
vi.mock('@components/partTime/schedule/PartTimeScheduleStaffFilter', () => ({
  PartTimeScheduleStaffFilter: ({
    isError,
    onRetry,
    onStaffChange,
  }: PartTimeScheduleStaffFilterProps) => (
    <div>
      {isError && <button onClick={onRetry}>필터 다시 불러오기</button>}
      <button onClick={() => onStaffChange(7)}>직원 7 선택</button>
    </div>
  ),
}));

vi.mock('@lib/utilities/capture/captureElementImage', () => ({
  captureElementImage: vi.fn(),
}));
vi.mock('@lib/utilities/capture/downloadBlob', () => ({
  downloadBlob: vi.fn(),
}));

function ImageSaveTrigger() {
  const { saveImage } = usePartTimeScheduleImage();

  return (
    <button
      onClick={() => {
        void saveImage();
      }}
    >
      직접 이미지 저장
    </button>
  );
}

const clients: QueryClient[] = [];
const renderCalendar = () => {
  const client = new QueryClient();
  clients.push(client);
  render(
    <QueryClientProvider client={client}>
      <PartTimeScheduleImageProvider>
        <PartTimeScheduleCalendar today="2026-10-15" initialMonth="2026-10" />
        <PartTimeScheduleImageSaveButton />
        <PartTimeScheduleActionButtons />
        <ImageSaveTrigger />
      </PartTimeScheduleImageProvider>
      <Toaster />
    </QueryClientProvider>,
  );
  return client;
};

afterEach(() => {
  cleanup();
  toast.dismiss();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.resetAllMocks();
});

describe('PartTimeScheduleCalendar 조회 범위와 계산 재사용', () => {
  const createSchedule = (date: string): PartTimeSchedule => ({
    id: 10,
    staff: { id: 7, name: '김알바', isDeleted: false },
    date,
    startTime: '09:00',
    endTime: '13:00',
    isCheckedIn: false,
    memo: '',
  });

  it.each([
    {
      date: '2026-10-01',
      month: '2026-09',
      from: '2026-08-31',
      to: '2026-10-04',
    },
    {
      date: '2026-10-30',
      month: '2026-11',
      from: '2026-10-26',
      to: '2026-12-06',
    },
  ])(
    '선택 날짜 $date가 새 격자에 포함되면 날짜 상세용 쿼리를 활성화하지 않는다',
    async ({ date, month, from, to }) => {
      const schedule = createSchedule(date);
      vi.mocked(getAllStaffs).mockResolvedValue([]);
      vi.mocked(getScheduleList).mockImplementation(async (params) =>
        date >= params.from && date <= params.to ? [schedule] : [],
      );
      const client = renderCalendar();
      await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(1));
      fireEvent.click(screen.getByRole('button', { name: `선택 ${date}` }));
      fireEvent.click(screen.getByRole('button', { name: `이동 ${month}` }));
      await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(2));
      expect(screen.getByTestId('selected-date').textContent).toBe(date);
      expect(screen.getByTestId('summary-staff').textContent).toBe('김알바');

      fireEvent.click(screen.getByRole('button', { name: '직원 7 선택' }));
      await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(3));
      expect(getScheduleList).toHaveBeenLastCalledWith(
        { from, to, staffId: 7 },
        expect.anything(),
      );
      await act(async () => {
        await client.invalidateQueries({ queryKey: scheduleKeys.all });
      });
      expect(getScheduleList).toHaveBeenCalledTimes(4);
      expect(getScheduleList).toHaveBeenLastCalledWith(
        { from, to, staffId: 7 },
        expect.anything(),
      );
    },
  );

  it('이전 달 날짜 클릭으로 표시 월이 바뀌면 새 격자를 한 번 조회한다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockResolvedValue([
      createSchedule('2026-09-30'),
    ]);
    renderCalendar();
    await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: '선택 2026-09-30' }));
    await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('displayed-month').textContent).toBe('2026-09');
    expect(getScheduleList).toHaveBeenLastCalledWith(
      { from: '2026-08-31', to: '2026-10-04', staffId: undefined },
      expect.anything(),
    );
    expect(screen.getByTestId('summary-staff').textContent).toBe('김알바');
  });

  it('월 이동으로 선택 날짜가 격자 밖에 남으면 기존 상세를 유지하고 두 범위를 갱신한다', async () => {
    const schedule = createSchedule('2026-10-15');
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockImplementation(async ({ from }) =>
      from === '2026-09-28' ? [schedule] : [],
    );
    const client = renderCalendar();
    await screen.findByTestId('summary-staff');
    fireEvent.click(screen.getByRole('button', { name: '이동 2026-12' }));
    await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('selected-date').textContent).toBe('2026-10-15');
    expect(screen.getByTestId('summary-staff').textContent).toBe('김알바');

    await act(async () => {
      await client.invalidateQueries({ queryKey: scheduleKeys.all });
    });
    expect(getScheduleList).toHaveBeenCalledTimes(4);
    expect(getScheduleList).toHaveBeenCalledWith(
      { from: '2026-09-28', to: '2026-11-01', staffId: undefined },
      expect.anything(),
    );
    expect(getScheduleList).toHaveBeenCalledWith(
      { from: '2026-11-30', to: '2027-01-03', staffId: undefined },
      expect.anything(),
    );
  });

  it('날짜 선택·삭제 확인 상태 변경에는 셀 내용을 재사용하고 데이터 변경 시 갱신한다', async () => {
    const schedule = createSchedule('2026-10-30');
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockResolvedValue([schedule]);
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    const client = renderCalendar();
    await waitFor(() =>
      expect(
        vi.mocked(Calendar).mock.lastCall?.[0].contentByDate?.[schedule.date],
      ).toBeDefined(),
    );
    const contentByDate = vi.mocked(Calendar).mock.lastCall![0].contentByDate;
    fireEvent.click(screen.getByRole('button', { name: '선택 2026-10-30' }));
    expect(vi.mocked(Calendar).mock.lastCall![0].contentByDate).toBe(
      contentByDate,
    );
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '삭제' }).hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(vi.mocked(Calendar).mock.lastCall![0].contentByDate).toBe(
      contentByDate,
    );
    expect(getScheduleList).toHaveBeenCalledTimes(1);

    act(() =>
      client.setQueryData(
        scheduleKeys.list({ from: '2026-09-28', to: '2026-11-01' }),
        [],
      ),
    );
    await waitFor(() =>
      expect(screen.queryByTestId('summary-staff')).toBeNull(),
    );
    expect(vi.mocked(Calendar).mock.lastCall![0].contentByDate).not.toBe(
      contentByDate,
    );
    expect(vi.mocked(Calendar).mock.lastCall![0].contentByDate).toEqual({});
  });
});

describe('PartTimeScheduleCalendar 조회 오류', () => {
  it('인라인 4xx는 캘린더를 유지한 채 한 줄 오류와 다시 시도를 보여준다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList)
      .mockRejectedValueOnce(
        new ApiError('BAD', 400, '요청 값이 올바르지 않아요.'),
      )
      .mockResolvedValue([]);
    renderCalendar();

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('요청 값이 올바르지 않아요.');
    expect(screen.getByRole('region', { name: '캘린더' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
    expect(getScheduleList).toHaveBeenCalledTimes(2);
  });

  it('필터 아르바이트생 목록 실패는 필터 안에서 다시 불러온다', async () => {
    vi.mocked(getScheduleList).mockResolvedValue([]);
    vi.mocked(getAllStaffs)
      .mockRejectedValueOnce(new ApiError('BAD', 400))
      .mockResolvedValue([]);
    renderCalendar();

    fireEvent.click(
      await screen.findByRole('button', { name: '필터 다시 불러오기' }),
    );
    await waitFor(() =>
      expect(
        screen.queryByRole('button', { name: '필터 다시 불러오기' }),
      ).toBeNull(),
    );
    expect(getAllStaffs).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).toBeNull();
  });
});

describe('PartTimeScheduleCalendar 쓰기', () => {
  const schedule = {
    id: 10,
    staff: { id: 7, name: '김알바', isDeleted: false },
    date: '2026-10-15',
    startTime: '09:00',
    endTime: '13:00',
    isCheckedIn: false,
    memo: '',
  };
  const setup = () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockResolvedValue([schedule]);
    renderCalendar();
  };

  it('삭제 취소는 요청하지 않는다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    setup();
    fireEvent.click(await screen.findByRole('button', { name: '삭제' }));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '삭제' }).hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(deleteSchedule).not.toHaveBeenCalled();
  });

  it('삭제 확인 후 대상 ID로 삭제하고 조회를 갱신한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteSchedule).mockResolvedValue(10);
    setup();
    fireEvent.click(await screen.findByRole('button', { name: '삭제' }));
    await waitFor(() => expect(deleteSchedule).toHaveBeenCalledWith(10));
    await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(2));
  });

  it('삭제 확인 중에는 확인 모달을 중복해서 열지 않는다', async () => {
    vi.mocked(openConfirmModal).mockImplementation(() => new Promise(() => {}));
    setup();
    const button = await screen.findByRole('button', { name: '삭제' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(openConfirmModal).toHaveBeenCalledTimes(1);
  });

  it('출근 확인은 전용 API에 상태를 보내고 조회를 갱신한다', async () => {
    vi.mocked(changeScheduleAttendance).mockResolvedValue({
      id: 10,
      isCheckedIn: true,
    });
    setup();
    fireEvent.click(await screen.findByRole('button', { name: '출근 변경' }));
    await waitFor(() =>
      expect(changeScheduleAttendance).toHaveBeenCalledWith(10, {
        status: 'ATTENDED',
      }),
    );
    await waitFor(() => expect(getScheduleList).toHaveBeenCalledTimes(2));
  });

  it.each(['삭제', '출근 변경'])(
    '%s 실패는 토스트로 알리고 기존 데이터를 유지한다',
    async (action) => {
      const error = new ApiError('BAD', 400, '요청을 처리하지 못했어요.');
      vi.mocked(openConfirmModal).mockResolvedValue(true);
      vi.mocked(deleteSchedule).mockRejectedValue(error);
      vi.mocked(changeScheduleAttendance).mockRejectedValue(error);
      setup();
      fireEvent.click(await screen.findByRole('button', { name: action }));
      expect(await screen.findByText(error.message)).toBeTruthy();
      expect(screen.queryByRole('alert')).toBeNull();
      expect(screen.getByText('미확인')).toBeTruthy();
      expect(getScheduleList).toHaveBeenCalledTimes(1);
    },
  );
});

describe('PartTimeScheduleCalendar 이미지 저장', () => {
  const blob = new Blob(['png'], { type: 'image/png' });
  const waitForSaveButton = async () => {
    const button = screen.getByRole('button', { name: '이미지 저장' });
    await waitFor(() =>
      expect(button.getAttribute('aria-disabled')).not.toBe('true'),
    );
    return button;
  };

  it('필터가 전체면 선택 날짜만 파일명에 넣는다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockResolvedValue([]);
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();

    fireEvent.click(await waitForSaveButton());

    await waitFor(() =>
      expect(downloadBlob).toHaveBeenCalledWith(
        blob,
        '아르바이트생-스케줄-2026-10-15.png',
      ),
    );
    expect(captureElementImage).toHaveBeenCalledWith(
      expect.objectContaining({ tagName: 'DIV' }),
      48,
    );
  });

  it('필터를 고르면 아르바이트생 이름을, 다른 달로 넘겨도 선택 날짜를 쓴다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([
      { id: 7, name: '김알바', isDeleted: false },
    ]);
    vi.mocked(getScheduleList).mockResolvedValue([]);
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();
    await waitFor(() => expect(getAllStaffs).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: '직원 7 선택' }));
    fireEvent.click(screen.getByRole('button', { name: '이동 2026-11' }));
    fireEvent.click(await waitForSaveButton());

    await waitFor(() =>
      expect(downloadBlob).toHaveBeenCalledWith(
        blob,
        '아르바이트생-스케줄-2026-10-15-김알바.png',
      ),
    );
  });

  it('저장 중에는 포커스를 유지하고 중복 실행을 막으며, 실패 후 다시 저장할 수 있다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockResolvedValue([]);
    const capture = Promise.withResolvers<Blob>();
    vi.mocked(captureElementImage).mockReturnValueOnce(capture.promise);
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();

    const button = await waitForSaveButton();
    button.focus();
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: '직접 이미지 저장' }));

    expect(button.textContent).toContain('저장 중…');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(document.activeElement).toBe(button);
    expect(captureElementImage).toHaveBeenCalledTimes(1);

    await act(async () => capture.reject(new Error('capture')));

    expect(
      await screen.findByText('이미지를 저장하지 못했어요. 다시 시도해주세요.'),
    ).toBeTruthy();
    expect(captureElementImage).toHaveBeenCalledTimes(1);
    expect(downloadBlob).not.toHaveBeenCalled();
    fireEvent.click(await waitForSaveButton());
    await waitFor(() =>
      expect(downloadBlob).toHaveBeenCalledWith(
        blob,
        '아르바이트생-스케줄-2026-10-15.png',
      ),
    );
  });

  it('최초 조회 중에는 저장을 막고, 정상적인 빈 목록을 받으면 저장한다', async () => {
    const schedules = Promise.withResolvers<PartTimeSchedule[]>();
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockReturnValue(schedules.promise);
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();

    expect(
      screen
        .getByRole('button', { name: '이미지 저장' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: '직접 이미지 저장' }));
    expect(captureElementImage).not.toHaveBeenCalled();

    await act(async () => schedules.resolve([]));
    fireEvent.click(await waitForSaveButton());
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
  });

  it('FAB의 이미지 저장도 준비 상태와 저장 중 잠금을 반영하고 스케줄 추가는 유지한다', async () => {
    const schedules = Promise.withResolvers<PartTimeSchedule[]>();
    const capture = Promise.withResolvers<Blob>();
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList).mockReturnValue(schedules.promise);
    vi.mocked(captureElementImage).mockReturnValue(capture.promise);
    renderCalendar();

    fireEvent.click(screen.getByRole('button', { name: '스케줄 액션 열기' }));
    const save = await screen.findByRole('menuitem', { name: '이미지 저장' });
    expect(save.getAttribute('aria-disabled')).toBe('true');
    expect(
      screen
        .getByRole('menuitem', { name: '스케줄 추가' })
        .getAttribute('aria-disabled'),
    ).not.toBe('true');
    fireEvent.click(save);
    expect(captureElementImage).not.toHaveBeenCalled();

    await act(async () => schedules.resolve([]));
    await waitFor(() =>
      expect(save.getAttribute('aria-disabled')).not.toBe('true'),
    );
    fireEvent.click(save);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
    fireEvent.click(screen.getByRole('button', { name: '스케줄 액션 열기' }));
    const saving = await screen.findByRole('menuitem', { name: '저장 중…' });
    expect(saving.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(saving);
    expect(captureElementImage).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole('menuitem', { name: '스케줄 추가' })
        .getAttribute('aria-disabled'),
    ).not.toBe('true');

    await act(async () => capture.resolve(blob));
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
  });

  it('조회 실패 시 저장을 막고 재시도가 성공하면 다시 허용한다', async () => {
    vi.mocked(getAllStaffs).mockResolvedValue([]);
    vi.mocked(getScheduleList)
      .mockRejectedValueOnce(new ApiError('BAD', 400, '조회 실패'))
      .mockResolvedValue([]);
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();

    await screen.findByRole('alert');
    expect(
      screen
        .getByRole('button', { name: '이미지 저장' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: '직접 이미지 저장' }));
    expect(captureElementImage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    fireEvent.click(await waitForSaveButton());
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
  });

  it('필터 응답을 기다리는 동안 이전 목록을 저장하지 않는다', async () => {
    const schedules = Promise.withResolvers<PartTimeSchedule[]>();
    vi.mocked(getAllStaffs).mockResolvedValue([
      { id: 7, name: '김알바', isDeleted: false },
    ]);
    vi.mocked(getScheduleList)
      .mockResolvedValueOnce([])
      .mockReturnValue(schedules.promise);
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();
    await waitForSaveButton();
    await waitFor(() => expect(getAllStaffs).toHaveBeenCalled());

    fireEvent.click(screen.getByRole('button', { name: '직원 7 선택' }));
    expect(
      screen
        .getByRole('button', { name: '이미지 저장' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: '직접 이미지 저장' }));
    expect(captureElementImage).not.toHaveBeenCalled();

    await act(async () => schedules.resolve([]));
    fireEvent.click(await waitForSaveButton());
    await waitFor(() =>
      expect(downloadBlob).toHaveBeenCalledWith(
        blob,
        '아르바이트생-스케줄-2026-10-15-김알바.png',
      ),
    );
  });

  it('현재 월 조회가 끝나도 다른 달의 선택 날짜 조회가 준비될 때까지 저장을 막는다', async () => {
    const selectedSchedules = Promise.withResolvers<PartTimeSchedule[]>();
    vi.mocked(getAllStaffs).mockResolvedValue([
      { id: 7, name: '김알바', isDeleted: false },
    ]);
    vi.mocked(getScheduleList).mockImplementation(async ({ from, staffId }) =>
      staffId === 7 && from === '2026-09-28' ? selectedSchedules.promise : [],
    );
    vi.mocked(captureElementImage).mockResolvedValue(blob);
    renderCalendar();
    await waitForSaveButton();
    fireEvent.click(screen.getByRole('button', { name: '이동 2026-12' }));
    await waitForSaveButton();
    fireEvent.click(screen.getByRole('button', { name: '직원 7 선택' }));

    await waitFor(() =>
      expect(getScheduleList).toHaveBeenCalledWith(
        { from: '2026-11-30', to: '2027-01-03', staffId: 7 },
        expect.anything(),
      ),
    );
    expect(
      screen
        .getByRole('button', { name: '이미지 저장' })
        .getAttribute('aria-disabled'),
    ).toBe('true');
    fireEvent.click(screen.getByRole('button', { name: '직접 이미지 저장' }));
    expect(captureElementImage).not.toHaveBeenCalled();

    await act(async () => selectedSchedules.resolve([]));
    fireEvent.click(await waitForSaveButton());
    await waitFor(() => expect(downloadBlob).toHaveBeenCalled());
  });
});
