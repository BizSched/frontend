import {
  QueryClient,
  QueryClientProvider,
  QueryObserver,
} from '@tanstack/react-query';
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
import { PartTimeScheduleFormModal } from '@components/partTime/schedule/modal/PartTimeScheduleFormModal';
import { PartTimeScheduleFormModalController } from '@components/partTime/schedule/modal/PartTimeScheduleFormModalController';

import { scheduleKeys } from '@hooks/api/schedule/scheduleQueryOptions';

import { ApiError } from '@lib/api/apiError';
import { updateSchedule } from '@lib/api/entities/schedule/api';
import { getAllStaffs } from '@lib/api/entities/staff/api';
import type { PartTimeSchedule } from '@lib/types/partTimeSchedule';

vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
}));
vi.mock('@lib/api/entities/staff/api', () => ({ getAllStaffs: vi.fn() }));
vi.mock('@hooks/overlay/useOverlayStackIndex', () => ({
  useOverlayStackIndex: () => 0,
}));

const SCHEDULE: PartTimeSchedule = {
  id: 10,
  staff: { id: 1, name: '김예림', isDeleted: false },
  date: '2026-10-14',
  startTime: '09:00',
  endTime: '13:00',
  isCheckedIn: false,
  memo: '',
};
const STAFFS = [SCHEDULE.staff, { id: 2, name: '강성구', isDeleted: false }];
const clients: QueryClient[] = [];
const unsubscribers: (() => void)[] = [];

const createDeferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  vi.mocked(getAllStaffs).mockResolvedValue(STAFFS);
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  toast.dismiss();
  unsubscribers.forEach((unsubscribe) => unsubscribe());
  unsubscribers.length = 0;
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.resetAllMocks();
  vi.unstubAllGlobals();
});

describe('PartTimeScheduleFormModal 폼·컨트롤러 통합', () => {
  const renderController = (schedule = SCHEDULE) => {
    const client = new QueryClient();
    clients.push(client);
    const close = vi.fn();
    render(
      <QueryClientProvider client={client}>
        <PartTimeScheduleFormModalController
          overlayId="integration"
          isOpen
          close={close}
          unmount={vi.fn()}
          mode="edit"
          schedule={schedule}
        />
        <Toaster />
      </QueryClientProvider>,
    );
    return { close, client };
  };

  const submitMemo = async (memo: string) => {
    fireEvent.change(
      screen.getByPlaceholderText('간단한 메모를 작성해주세요'),
      { target: { value: memo } },
    );
    const submit = screen.getByRole('button', { name: '수정 완료' });
    await waitFor(() =>
      expect(submit.getAttribute('aria-disabled')).not.toBe('true'),
    );
    fireEvent.click(submit);
    await waitFor(() => expect(updateSchedule).toHaveBeenCalledTimes(1));
  };

  const pressBackdrop = () => {
    const backdrop = document.querySelector('[data-slot="modal-backdrop"]')!;
    fireEvent.pointerDown(backdrop, { button: 0, pointerType: 'mouse' });
    fireEvent.mouseDown(backdrop, { button: 0 });
    fireEvent.pointerUp(backdrop, { button: 0, pointerType: 'mouse' });
    fireEvent.mouseUp(backdrop, { button: 0 });
    fireEvent.click(backdrop, { button: 0 });
  };

  it('저장 요청과 활성 조회 갱신이 끝날 때까지 모든 입력을 잠근다', async () => {
    const request = createDeferred<PartTimeSchedule>();
    const refresh = createDeferred<PartTimeSchedule[]>();
    vi.mocked(updateSchedule).mockReturnValue(request.promise);
    const { close, client } = renderController();
    const key = scheduleKeys.list({
      from: '2026-10-12',
      to: '2026-10-18',
      staffId: 1,
    });
    client.setQueryData(key, [SCHEDULE]);
    const refetch = vi.fn(() => refresh.promise);
    const observer = new QueryObserver(client, {
      queryKey: key,
      queryFn: refetch,
      staleTime: Infinity,
    });
    unsubscribers.push(observer.subscribe(() => {}));

    await submitMemo('저장할 내용');

    const assertLocked = () => {
      const memo = screen.getByPlaceholderText(
        '간단한 메모를 작성해주세요',
      ) as HTMLInputElement;
      expect(memo.disabled).toBe(true);
      for (const name of [
        /김예림/,
        '2026.10.14',
        '09:00',
        '13:00',
        /오후/,
        '취소',
        '닫기',
      ]) {
        expect(screen.getByRole('button', { name }).matches(':disabled')).toBe(
          true,
        );
      }
      expect(
        screen
          .getByRole('button', { name: '수정 완료' })
          .getAttribute('aria-disabled'),
      ).toBe('true');
      expect(memo.closest('form')?.getAttribute('aria-busy')).toBe('true');
      expect(close).not.toHaveBeenCalled();
    };
    assertLocked();
    fireEvent.click(screen.getByRole('button', { name: /오후/ }));
    expect(screen.getByRole('button', { name: '09:00' })).toBeTruthy();
    await act(async () =>
      request.resolve({ ...SCHEDULE, memo: '저장할 내용' }),
    );
    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1));
    assertLocked();
    await act(async () =>
      refresh.resolve([{ ...SCHEDULE, memo: '저장할 내용' }]),
    );
    await waitFor(() =>
      expect(close).toHaveBeenCalledWith(
        expect.objectContaining({ memo: '저장할 내용' }),
      ),
    );
  });

  it('저장 중에는 취소·X·ESC·딤 클릭으로 닫히지 않는다', async () => {
    const request = createDeferred<PartTimeSchedule>();
    vi.mocked(updateSchedule).mockReturnValue(request.promise);
    const { close } = renderController();
    await submitMemo('저장할 내용');

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    fireEvent.keyDown(screen.getByRole('dialog'), {
      key: 'Escape',
      code: 'Escape',
    });
    pressBackdrop();
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeTruthy();

    await act(async () =>
      request.resolve({ ...SCHEDULE, memo: '저장할 내용' }),
    );
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
  });

  it.each(['취소', '닫기', 'ESC', '딤'])(
    '저장 전에는 %s로 닫을 수 있다',
    async (action) => {
      const { close } = renderController();
      await screen.findByRole('dialog');
      if (action === 'ESC') {
        fireEvent.keyDown(screen.getByRole('dialog'), {
          key: 'Escape',
          code: 'Escape',
        });
      } else if (action === '딤') {
        pressBackdrop();
      } else {
        fireEvent.click(screen.getByRole('button', { name: action }));
      }
      await waitFor(() => expect(close).toHaveBeenCalledWith(null));
    },
  );

  it.each(['', '원래 메모'])(
    '메모 "%s"의 앞뒤 공백만 바꾸면 제출을 비활성화한다',
    async (memo) => {
      const { close } = renderController({ ...SCHEDULE, memo });
      fireEvent.change(
        screen.getByPlaceholderText('간단한 메모를 작성해주세요'),
        { target: { value: ` ${memo} ` } },
      );
      const submit = screen.getByRole('button', { name: '수정 완료' });
      await waitFor(() =>
        expect(submit.getAttribute('aria-disabled')).toBe('true'),
      );
      await act(async () => {
        fireEvent.submit(submit.closest('form')!);
      });
      expect(updateSchedule).not.toHaveBeenCalled();
      expect(close).not.toHaveBeenCalled();
    },
  );

  it('공백을 정리한 메모가 같으면 다른 변경 필드만 PATCH한다', async () => {
    vi.mocked(updateSchedule).mockResolvedValue({
      ...SCHEDULE,
      startTime: '13:00',
      endTime: '18:00',
      memo: '원래 메모',
    });
    const { close } = renderController({ ...SCHEDULE, memo: '원래 메모' });
    fireEvent.change(
      screen.getByPlaceholderText('간단한 메모를 작성해주세요'),
      { target: { value: ' 원래 메모 ' } },
    );
    fireEvent.click(screen.getByRole('button', { name: /오후/ }));
    const submit = screen.getByRole('button', { name: '수정 완료' });
    await waitFor(() =>
      expect(submit.getAttribute('aria-disabled')).not.toBe('true'),
    );
    fireEvent.click(submit);
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
    expect(updateSchedule).toHaveBeenCalledWith(10, {
      startTime: '13:00',
      endTime: '18:00',
    });
  });

  it('실패하면 입력과 닫기를 다시 허용하고 입력값을 유지한 채 재시도한다', async () => {
    const request = createDeferred<PartTimeSchedule>();
    vi.mocked(updateSchedule)
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue({ ...SCHEDULE, memo: '다시 저장' });
    const { close } = renderController();
    await submitMemo('저장할 내용');
    await act(async () =>
      request.reject(
        new ApiError('SCHEDULE_TIME_CONFLICT', 409, '시간이 겹칩니다.'),
      ),
    );
    expect(await screen.findByText('시간이 겹칩니다.')).toBeTruthy();
    const memo = screen.getByPlaceholderText(
      '간단한 메모를 작성해주세요',
    ) as HTMLInputElement;
    expect(memo.value).toBe('저장할 내용');
    expect(memo.disabled).toBe(false);
    expect(
      screen.getByRole('button', { name: '취소' }).matches(':disabled'),
    ).toBe(false);
    expect(close).not.toHaveBeenCalled();
    fireEvent.change(memo, { target: { value: '다시 저장' } });
    fireEvent.click(screen.getByRole('button', { name: '수정 완료' }));
    await waitFor(() => expect(close).toHaveBeenCalledTimes(1));
    expect(updateSchedule).toHaveBeenNthCalledWith(2, 10, {
      memo: '다시 저장',
    });
    await waitFor(() =>
      expect(screen.queryByText('시간이 겹칩니다.')).toBeNull(),
    );
  });
});

describe('PartTimeScheduleFormModal 수정 모드', () => {
  const renderForm = (schedule = SCHEDULE, isPending = false) => {
    const onSubmit = vi.fn();
    render(
      <PartTimeScheduleFormModal
        open
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        mode="edit"
        schedule={schedule}
        staffs={STAFFS}
        isPending={isPending}
      />,
    );
    return { onSubmit };
  };

  it('변경이 없거나 변경을 되돌리면 제출하지 않는다', async () => {
    const { onSubmit } = renderForm();
    const button = screen.getByRole('button', { name: '수정 완료' });
    const memo = screen.getByPlaceholderText('간단한 메모를 작성해주세요');
    await waitFor(() =>
      expect(button.getAttribute('aria-disabled')).toBe('true'),
    );
    fireEvent.change(memo, { target: { value: '메모' } });
    await waitFor(() =>
      expect(button.getAttribute('aria-disabled')).not.toBe('true'),
    );
    fireEvent.change(memo, { target: { value: '' } });
    await waitFor(() =>
      expect(button.getAttribute('aria-disabled')).toBe('true'),
    );
    fireEvent.submit(button.closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each([
    { startTime: '13:00', endTime: '13:00' },
    { startTime: '22:00', endTime: '02:00' },
  ])(
    '같은 시간과 자정을 넘는 근무는 문구를 보이고 제출하지 않는다',
    async (times) => {
      const { onSubmit } = renderForm({ ...SCHEDULE, ...times });
      expect(screen.getByRole('alert').textContent).toBe(
        '마감 시간은 시작 시간보다 늦게 선택해주세요.',
      );
      fireEvent.change(
        screen.getByPlaceholderText('간단한 메모를 작성해주세요'),
        {
          target: { value: '변경' },
        },
      );
      const button = screen.getByRole('button', { name: '수정 완료' });
      await waitFor(() =>
        expect(button.getAttribute('aria-disabled')).toBe('true'),
      );
      fireEvent.submit(button.closest('form')!);
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it('빠른 선택도 변경으로 인식하고 제출할 수 있다', async () => {
    const { onSubmit } = renderForm();
    fireEvent.click(screen.getByRole('button', { name: /오후/ }));
    const button = screen.getByRole('button', { name: '수정 완료' });
    await waitFor(() =>
      expect(button.getAttribute('aria-disabled')).not.toBe('true'),
    );
    fireEvent.click(button);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({
        staffId: 1,
        date: SCHEDULE.date,
        startTime: '13:00',
        endTime: '18:00',
        memo: '',
      }),
    );
  });

  it('메모를 UTF-16 500자에서 자르고 한글 조합이 끝난 뒤 자른다', async () => {
    renderForm();
    const memo = screen.getByPlaceholderText(
      '간단한 메모를 작성해주세요',
    ) as HTMLTextAreaElement;
    fireEvent.change(memo, { target: { value: '😀'.repeat(251) } });
    await waitFor(() => expect(memo.value).toBe('😀'.repeat(250)));
    expect(screen.getByText('공백포함 500자 | 공백제외 500자')).toBeTruthy();
    fireEvent.compositionStart(memo);
    fireEvent.input(memo, {
      target: { value: '가'.repeat(501) },
      isComposing: true,
    });
    expect(memo.value).toBe('가'.repeat(501));
    fireEvent.compositionEnd(memo);
    await waitFor(() => expect(memo.value).toBe('가'.repeat(500)));
    expect(
      screen
        .getByRole('button', { name: '수정 완료' })
        .getAttribute('aria-disabled'),
    ).not.toBe('true');
  });

  it('줄바꿈을 유지해 제출하고 공백 포함·제외 글자 수를 보인다', async () => {
    const { onSubmit } = renderForm();
    const memo = screen.getByPlaceholderText('간단한 메모를 작성해주세요');
    expect(memo.tagName).toBe('TEXTAREA');
    expect(screen.getByText('공백포함 0자 | 공백제외 0자')).toBeTruthy();
    fireEvent.change(memo, { target: { value: '오픈 준비\n재고 확인' } });
    expect(screen.getByText('공백포함 11자 | 공백제외 8자')).toBeTruthy();
    const button = screen.getByRole('button', { name: '수정 완료' });
    await waitFor(() =>
      expect(button.getAttribute('aria-disabled')).not.toBe('true'),
    );
    fireEvent.click(button);
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ memo: '오픈 준비\n재고 확인' }),
      ),
    );
  });

  it('요청 중에는 수정 사항이 있어도 제출하지 않는다', async () => {
    const { onSubmit } = renderForm(SCHEDULE, true);
    fireEvent.change(
      screen.getByPlaceholderText('간단한 메모를 작성해주세요'),
      {
        target: { value: '변경' },
      },
    );
    const button = screen.getByRole('button', { name: '수정 완료' });
    expect(button.getAttribute('aria-disabled')).toBe('true');
    fireEvent.submit(button.closest('form')!);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('담당 아르바이트생은 바꿀 수 없다', async () => {
    renderForm();

    const trigger = await screen.findByRole('button', { name: /김예림/ });
    expect(trigger.matches(':disabled')).toBe(true);
  });
});

describe('PartTimeScheduleFormModal 추가 모드', () => {
  const renderForm = () =>
    render(
      <PartTimeScheduleFormModal
        open
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        mode="create"
        staffs={STAFFS}
      />,
    );

  it('아르바이트생을 선택할 수 있다', async () => {
    renderForm();

    const trigger = await screen.findByRole('button', {
      name: '아르바이트생을 선택해주세요',
    });
    expect(trigger.matches(':disabled')).toBe(false);
  });

  it('시작과 마감을 모두 고른 뒤 마감이 늦지 않을 때만 문구를 보인다', async () => {
    renderForm();
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: '근무 마감 시간을 선택해주세요' }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: '09:00' }));
    expect(screen.queryByRole('alert')).toBeNull();

    fireEvent.click(
      screen.getByRole('button', { name: '근무 시작 시간을 선택해주세요' }),
    );
    fireEvent.click(await screen.findByRole('menuitem', { name: '09:00' }));
    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toBe(
      '마감 시간은 시작 시간보다 늦게 선택해주세요.',
    );
    expect(
      alert.closest('[role="group"]')?.getAttribute('aria-describedby'),
    ).toBe(alert.id);

    fireEvent.click(screen.getByRole('button', { name: /오후/ }));
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });
});
