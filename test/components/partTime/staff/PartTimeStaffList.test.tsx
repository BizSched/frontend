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

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { Toaster, toast } from '@components/_common/Toast/Toaster';
import type { PartTimeStaffDetailPanelProps } from '@components/partTime/staff/PartTimeStaffDetailPanel';
import { PartTimeStaffList } from '@components/partTime/staff/PartTimeStaffList';

import { staffKeys } from '@hooks/api/staff/staffQueryOptions';

import { ApiError } from '@lib/api/apiError';
import { getScheduleList } from '@lib/api/entities/schedule/api';
import {
  changeStaffEmploymentStatus,
  deleteStaff,
  getStaffDetail,
  getStaffList,
} from '@lib/api/entities/staff/api';
import type {
  PartTimeStaffDetailItem,
  PartTimeStaffListItem,
} from '@lib/types/partTimeStaff';

const navigation = vi.hoisted(() => ({
  search: '',
  push: vi.fn(),
  back: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/partTime/staff',
  useSearchParams: () => new URLSearchParams(navigation.search),
  useRouter: () => ({ push: navigation.push, back: navigation.back }),
}));
vi.mock('@lib/api/entities/staff/api', () => ({
  changeStaffEmploymentStatus: vi.fn(),
  deleteStaff: vi.fn(),
  getStaffList: vi.fn(),
  getStaffDetail: vi.fn(),
}));
vi.mock('@components/_common/Modal/openConfirmModal', () => ({
  openConfirmModal: vi.fn(),
}));
vi.mock('@lib/api/entities/schedule/api', () => ({
  getScheduleList: vi.fn(async () => []),
}));
vi.mock('@assets/icons/ic_empty.svg', () => ({ default: '/empty.svg' }));
vi.mock('@components/partTime/staff/PartTimeStaffCard', () => ({
  PartTimeStaffCard: ({
    staff,
    onDetailOpen,
    onDelete,
    isDeletePending,
  }: {
    staff: PartTimeStaffListItem;
    onDetailOpen: () => void;
    onDelete: () => void;
    isDeletePending: boolean;
  }) => (
    <>
      <button onClick={onDetailOpen}>{staff.name}</button>
      <button onClick={onDelete} disabled={isDeletePending}>
        {staff.name} 삭제
      </button>
    </>
  ),
}));
vi.mock('@components/partTime/staff/PartTimeStaffDetailOverlay', () => ({
  PartTimeStaffDetailOverlay: ({
    open,
    staff,
    listStaff,
    isLoading,
    error,
    onOpenChange,
    onEmploymentStatusChange,
    isEmploymentStatusLocked,
    isEmploymentStatusPending,
  }: PartTimeStaffDetailPanelProps) =>
    open ? (
      <div role="dialog">
        <span>{staff?.name ?? listStaff?.name ?? '상세'}</span>
        {isLoading && <p>상세 로딩 중</p>}
        {!!error && <p>상세 오류</p>}
        {(['onLeave', 'employed'] as const).map((employmentStatus) => (
          <button
            key={employmentStatus}
            disabled={isEmploymentStatusLocked}
            onClick={() =>
              onEmploymentStatusChange?.(
                staff?.id ?? listStaff?.id ?? 0,
                employmentStatus,
              )
            }
          >
            {employmentStatus}로 변경
          </button>
        ))}
        {isEmploymentStatusPending && <p>재직 상태 변경 중</p>}
        <button onClick={() => onOpenChange(false)}>닫기</button>
      </div>
    ) : null,
}));

const STAFF: PartTimeStaffListItem = {
  id: 42,
  name: '김알바',
  phone: null,
  createdAt: '2026-10-14T09:00:00+09:00',
  employmentStatus: 'employed',
};
const DETAIL: PartTimeStaffDetailItem = {
  ...STAFF,
  attachments: [],
  memo: null,
};
const NOW = '2026-10-14T12:00';
const clients: QueryClient[] = [];
const renderList = (page = 1, items = [STAFF], totalPage = 1) => {
  const client = new QueryClient();
  clients.push(client);
  client.setQueryData(staffKeys.list({ page, size: 10 }), {
    page,
    size: 10,
    items,
    totalCount: items.length,
    totalPage,
  });
  const result = render(
    <QueryClientProvider client={client}>
      <PartTimeStaffList now={NOW} />
      <Toaster />
    </QueryClientProvider>,
  );
  return { ...result, client };
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getStaffList).mockReset();
  vi.mocked(getStaffDetail).mockReset();
  vi.mocked(getScheduleList).mockReset().mockResolvedValue([]);
  vi.mocked(deleteStaff).mockReset();
  vi.mocked(changeStaffEmploymentStatus).mockReset();
  vi.mocked(openConfirmModal).mockReset();
  navigation.search = '';
  vi.stubGlobal('matchMedia', () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(window.history, 'replaceState');
  vi.spyOn(window.history, 'pushState');
});
afterEach(() => {
  cleanup();
  toast.dismiss();
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('PartTimeStaffList API 연동', () => {
  it('삭제 확인을 취소하면 API와 목록·URL을 유지한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: '김알바 삭제' })
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(openConfirmModal).toHaveBeenCalledTimes(1);
    expect(openConfirmModal).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining(
          '아직 오지 않은 근무 스케쥴도 함께 삭제',
        ),
      }),
    );
    expect(deleteStaff).not.toHaveBeenCalled();
    expect(getStaffList).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it('확인 모달과 삭제 요청 중에는 중복 삭제를 막고 성공 후 목록을 갱신한다', async () => {
    let confirm!: (value: boolean) => void;
    let resolveDelete!: (id: number) => void;
    vi.mocked(openConfirmModal).mockImplementation(
      () =>
        new Promise((resolve) => {
          confirm = resolve;
        }),
    );
    vi.mocked(deleteStaff).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDelete = resolve;
        }),
    );
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    renderList();
    const button = screen.getByRole('button', { name: '김알바 삭제' });

    act(() => {
      button.click();
      button.click();
    });
    expect(openConfirmModal).toHaveBeenCalledTimes(1);
    expect(deleteStaff).not.toHaveBeenCalled();
    await act(async () => confirm(true));
    await waitFor(() => expect(deleteStaff).toHaveBeenCalledWith(42));
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.getByRole('status').textContent).toContain('삭제하는 중');
    fireEvent.click(button);
    expect(deleteStaff).toHaveBeenCalledTimes(1);

    await act(async () => resolveDelete(42));
    await waitFor(() =>
      expect(screen.getByText('등록된 아르바이트생이 없어요.')).toBeTruthy(),
    );
  });

  it('삭제 실패는 BE 문구를 토스트로 알리고 다시 시도하면 이전 토스트를 지운다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockRejectedValue(
      new ApiError('INVALID_REQUEST', 400, '삭제할 수 없어요.'),
    );
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    expect(await screen.findByText('삭제할 수 없어요.')).toBeTruthy();
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: '김알바 삭제' })
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(deleteStaff).toHaveBeenCalledTimes(1);
    expect(getStaffList).not.toHaveBeenCalled();
    expect(window.history.replaceState).not.toHaveBeenCalled();
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));
    await waitFor(() =>
      expect(screen.queryByText('삭제할 수 없어요.')).toBeNull(),
    );
  });

  it('STAFF_NOT_FOUND 오류면 목록을 자동으로 다시 불러와 이미 삭제된 카드를 제거한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockRejectedValue(
      new ApiError('STAFF_NOT_FOUND', 404, '아르바이트생을 찾을 수 없어요.'),
    );
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    expect(
      await screen.findByText('아르바이트생을 찾을 수 없어요.'),
    ).toBeTruthy();
    await waitFor(() =>
      expect(screen.getByText('등록된 아르바이트생이 없어요.')).toBeTruthy(),
    );
    expect(deleteStaff).toHaveBeenCalledTimes(1);
    expect(getStaffList).toHaveBeenCalledTimes(1);
  });

  it('STAFF_NOT_FOUND 뒤 목록 재조회 실패는 조회 오류와 다시 시도로 복구한다', async () => {
    let rejectList!: (error: Error) => void;
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockRejectedValue(
      new ApiError('STAFF_NOT_FOUND', 404, '아르바이트생을 찾을 수 없어요.'),
    );
    vi.mocked(getStaffList).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectList = reject;
        }),
    );
    renderList();
    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() =>
      expect(
        screen.getByText('아르바이트생 목록을 갱신하는 중입니다.'),
      ).toBeTruthy(),
    );
    await act(async () => rejectList(new ApiError('INVALID_REQUEST', 400)));
    const retry = await screen.findByRole('button', { name: '다시 시도' });
    expect(deleteStaff).toHaveBeenCalledTimes(1);
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    fireEvent.click(retry);
    await waitFor(() =>
      expect(screen.getByText('등록된 아르바이트생이 없어요.')).toBeTruthy(),
    );
  });

  it('STAFF_NOT_FOUND인 직원의 상세는 닫고 목록을 다시 불러온다', async () => {
    navigation.search = 'staffId=42&tag=keep';
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockRejectedValue(
      new ApiError('STAFF_NOT_FOUND', 404, '아르바이트생을 찾을 수 없어요.'),
    );
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await screen.findByText('아르바이트생을 찾을 수 없어요.');
    await waitFor(() => expect(getStaffList).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/partTime/staff?tag=keep',
    );
    expect(navigation.back).not.toHaveBeenCalled();
  });

  it('목록 재조회가 지연되어도 삭제한 카드와 상세는 먼저 닫고 다른 직원의 삭제는 허용한다', async () => {
    navigation.search = 'staffId=42&tag=keep';
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockResolvedValue(42);
    vi.mocked(getStaffList).mockImplementation(() => new Promise(() => {}));
    renderList(1, [STAFF, { ...STAFF, id: 99, name: '다른 직원' }]);

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '김알바' })).toBeNull(),
    );
    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: '다른 직원 삭제' })
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.queryByText('아르바이트생을 삭제하는 중입니다.')).toBeNull();
    expect(
      screen.getByText('아르바이트생 목록을 갱신하는 중입니다.'),
    ).toBeTruthy();
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/partTime/staff?tag=keep',
    );

    vi.mocked(openConfirmModal).mockResolvedValue(false);
    fireEvent.click(screen.getByRole('button', { name: '다른 직원 삭제' }));
    await waitFor(() => expect(openConfirmModal).toHaveBeenCalledTimes(2));
    expect(screen.queryByRole('button', { name: '김알바' })).toBeNull();
    expect(deleteStaff).toHaveBeenCalledTimes(1);
  });

  it('마지막 직원 삭제 후 재조회 중에는 빈 목록을 먼저 표시하지 않는다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockResolvedValue(42);
    vi.mocked(getStaffList).mockImplementation(() => new Promise(() => {}));
    renderList();
    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() =>
      expect(screen.queryByRole('button', { name: '김알바' })).toBeNull(),
    );
    await waitFor(() =>
      expect(
        screen.queryByText('아르바이트생을 삭제하는 중입니다.'),
      ).toBeNull(),
    );
    expect(
      screen.getByText('아르바이트생 목록을 갱신하는 중입니다.'),
    ).toBeTruthy();
    expect(screen.queryByText('등록된 아르바이트생이 없어요.')).toBeNull();
  });

  it('삭제한 직원의 상세는 닫고 다른 검색값은 보존한다', async () => {
    navigation.search = 'staffId=42&tag=keep';
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockResolvedValue(42);
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/partTime/staff?tag=keep',
    );
    expect(navigation.back).not.toHaveBeenCalled();
  });

  it('서버·네트워크 삭제 실패는 공통 문구로 알리고 목록을 다시 불러오지 않는다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockRejectedValue(new Error('internal details'));
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    expect(
      await screen.findByText(
        '일시적인 오류가 발생했어요. 잠시 후 다시 시도해주세요.',
      ),
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: STAFF.name })).toBeTruthy();
    expect(deleteStaff).toHaveBeenCalledTimes(1);
    expect(getStaffList).not.toHaveBeenCalled();
  });

  it('다른 직원 상세를 보고 있다면 삭제 후에도 유지한다', async () => {
    navigation.search = 'staffId=99&tag=keep';
    vi.mocked(getStaffDetail).mockResolvedValue({
      ...DETAIL,
      id: 99,
      name: '다른 직원',
    });
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockResolvedValue(42);
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    renderList();

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() =>
      expect(screen.getByText('등록된 아르바이트생이 없어요.')).toBeTruthy(),
    );
    expect(screen.getByRole('dialog').textContent).toContain('다른 직원');
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it('마지막 페이지의 마지막 직원을 삭제하면 이전 페이지로 보정한다', async () => {
    navigation.search = 'page=2&tag=keep';
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteStaff).mockResolvedValue(42);
    vi.mocked(getStaffList).mockImplementation(async (params) => ({
      page: params?.page ?? 1,
      size: 10,
      totalCount: 10,
      totalPage: 1,
      items:
        params?.page === 2
          ? []
          : [{ ...STAFF, id: 99, name: '이전 페이지 직원' }],
    }));
    renderList(2, [STAFF], 2);

    fireEvent.click(screen.getByRole('button', { name: '김알바 삭제' }));

    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: '이전 페이지 직원' }),
      ).toBeTruthy(),
    );
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/partTime/staff?tag=keep',
    );
    expect(screen.queryByText('등록된 아르바이트생이 없어요.')).toBeNull();
  });

  it('hydration 목록을 재요청하지 않고 목록 캐시로 상세를 먼저 그린다', async () => {
    navigation.search = 'staffId=42';
    let resolveDetail!: (staff: PartTimeStaffDetailItem) => void;
    vi.mocked(getStaffDetail).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveDetail = resolve;
        }),
    );
    renderList();
    expect(screen.getByRole('dialog').textContent).toContain('김알바');
    expect(screen.getByText('상세 로딩 중')).toBeTruthy();
    expect(window.history.replaceState).not.toHaveBeenCalled();
    expect(getStaffList).not.toHaveBeenCalled();
    await act(async () => {
      resolveDetail({ ...DETAIL, name: '상세 이름' });
    });
    await waitFor(() =>
      expect(screen.getByRole('dialog').textContent).toContain('상세 이름'),
    );
    expect(getScheduleList).toHaveBeenCalledWith(
      { from: '2026-10-12', to: '2026-10-18', staffId: 42 },
      expect.anything(),
    );
  });

  it('빈 목록의 직접 링크도 조회를 기다리며 닫을 수 있고, 404 뒤에만 URL을 정리한다', async () => {
    navigation.search = 'staffId=42&tag=keep';
    let rejectDetail!: (error: Error) => void;
    vi.mocked(getStaffDetail).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectDetail = reject;
        }),
    );
    renderList(1, [], 0);
    expect(screen.getByRole('button', { name: '닫기' })).toBeTruthy();
    expect(window.history.replaceState).not.toHaveBeenCalled();
    await act(async () => {
      rejectDetail(new ApiError('STAFF_NOT_FOUND', 404));
    });
    await waitFor(() =>
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '/partTime/staff?tag=keep',
      ),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('목록 현재 페이지에 없는 직접 링크의 상세를 정상적으로 연다', async () => {
    navigation.search = 'staffId=99';
    vi.mocked(getStaffDetail).mockResolvedValue({
      ...DETAIL,
      id: 99,
      name: '다른 페이지 직원',
    });
    renderList();
    await waitFor(() =>
      expect(screen.getByRole('dialog').textContent).toContain(
        '다른 페이지 직원',
      ),
    );
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });

  it('범위를 넘는 페이지는 빈 목록 대신 캐시된 마지막 페이지를 바로 그린다', async () => {
    navigation.search = 'page=99';
    const client = new QueryClient();
    clients.push(client);
    client.setQueryData(staffKeys.list({ page: 99, size: 10 }), {
      page: 99,
      size: 10,
      items: [],
      totalCount: 11,
      totalPage: 2,
    });
    client.setQueryData(staffKeys.list({ page: 2, size: 10 }), {
      page: 2,
      size: 10,
      items: [STAFF],
      totalCount: 11,
      totalPage: 2,
    });
    render(
      <QueryClientProvider client={client}>
        <PartTimeStaffList now={NOW} />
      </QueryClientProvider>,
    );
    expect(screen.getByRole('button', { name: STAFF.name })).toBeTruthy();
    expect(screen.queryByText('등록된 아르바이트생이 없어요.')).toBeNull();
    await waitFor(() =>
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '/partTime/staff?page=2',
      ),
    );
    expect(getStaffList).not.toHaveBeenCalled();
  });

  it.each(['abc', '', '0', '-1', '1.5', '9007199254740993'])(
    '잘못된 staffId=%s는 요청하지 않고 URL에서 지운다',
    async (staffId) => {
      navigation.search = `staffId=${staffId}&tag=keep`;
      renderList();
      await waitFor(() =>
        expect(window.history.replaceState).toHaveBeenCalledWith(
          null,
          '',
          '/partTime/staff?tag=keep',
        ),
      );
      expect(getStaffDetail).not.toHaveBeenCalled();
      expect(screen.queryByRole('dialog')).toBeNull();
    },
  );

  it('404 외 상세 오류는 재시도하지 않고 목록과 URL을 유지한다', async () => {
    navigation.search = 'staffId=42';
    vi.mocked(getStaffDetail).mockRejectedValue(
      new ApiError('INVALID_REQUEST', 400),
    );
    renderList();
    await waitFor(() => expect(screen.getByText('상세 오류')).toBeTruthy());
    expect(getStaffDetail).toHaveBeenCalledTimes(1);
    expect(window.history.replaceState).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: STAFF.name })).toBeTruthy();
  });

  it('조회 중 직접 링크로 연 패널을 닫으면 다른 검색값을 보존한다', () => {
    navigation.search = 'staffId=42&tag=keep';
    vi.mocked(getStaffDetail).mockImplementation(() => new Promise(() => {}));
    renderList();
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/partTime/staff?tag=keep',
    );
    expect(navigation.back).not.toHaveBeenCalled();
  });
});

describe('PartTimeStaffList 재직 상태 변경', () => {
  beforeEach(() => {
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 1,
      totalPage: 1,
      items: [STAFF],
    });
  });

  it('휴직·퇴사로 바꿀 때만 확인하고, 취소하면 요청하지 않는다', async () => {
    navigation.search = 'staffId=42';
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    renderList();

    fireEvent.click(
      await screen.findByRole('button', { name: 'onLeave로 변경' }),
    );

    await waitFor(() =>
      expect(
        screen
          .getByRole('button', { name: 'onLeave로 변경' })
          .hasAttribute('disabled'),
      ).toBe(false),
    );
    expect(openConfirmModal).toHaveBeenCalledWith({
      title: '재직 상태를 바꾸시겠어요?',
      description:
        '아직 오지 않은 근무 스케쥴이 삭제돼요. 다시 재직으로 바꿔도 복구되지 않아요.',
      confirmText: '변경',
    });
    expect(changeStaffEmploymentStatus).not.toHaveBeenCalled();
  });

  it('확인 모달과 요청 중에는 중복 변경을 막고 확인하면 요청한다', async () => {
    navigation.search = 'staffId=42';
    let confirm!: (value: boolean) => void;
    let resolveChange!: (value: {
      id: number;
      employmentStatus: 'onLeave';
    }) => void;
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(openConfirmModal).mockImplementation(
      () =>
        new Promise((resolve) => {
          confirm = resolve;
        }),
    );
    vi.mocked(changeStaffEmploymentStatus).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveChange = resolve;
        }),
    );
    renderList();
    const button = await screen.findByRole('button', {
      name: 'onLeave로 변경',
    });

    act(() => {
      button.click();
      button.click();
    });
    expect(openConfirmModal).toHaveBeenCalledTimes(1);
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(screen.queryByText('재직 상태 변경 중')).toBeNull();

    await act(async () => confirm(true));
    await waitFor(() =>
      expect(changeStaffEmploymentStatus).toHaveBeenCalledWith(42, 'onLeave'),
    );
    expect(screen.getByText('재직 상태 변경 중')).toBeTruthy();
    expect(button.hasAttribute('disabled')).toBe(true);

    await act(async () =>
      resolveChange({ id: 42, employmentStatus: 'onLeave' }),
    );
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(false));
    expect(changeStaffEmploymentStatus).toHaveBeenCalledTimes(1);
  });

  it('재직으로 바꿀 때는 확인 없이 요청한다', async () => {
    navigation.search = 'staffId=42';
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(changeStaffEmploymentStatus).mockResolvedValue({
      id: 42,
      employmentStatus: 'employed',
    });
    renderList();

    fireEvent.click(
      await screen.findByRole('button', { name: 'employed로 변경' }),
    );

    await waitFor(() =>
      expect(changeStaffEmploymentStatus).toHaveBeenCalledWith(42, 'employed'),
    );
    expect(openConfirmModal).not.toHaveBeenCalled();
  });

  it('변경 실패는 토스트로 알리고 상세를 유지한다', async () => {
    navigation.search = 'staffId=42';
    vi.mocked(getStaffDetail).mockResolvedValue(DETAIL);
    vi.mocked(changeStaffEmploymentStatus).mockRejectedValue(
      new ApiError('INVALID_REQUEST', 400, '바꿀 수 없어요.'),
    );
    renderList();

    fireEvent.click(
      await screen.findByRole('button', { name: 'employed로 변경' }),
    );

    expect(await screen.findByText('바꿀 수 없어요.')).toBeTruthy();
    expect(screen.getByRole('dialog').textContent).toContain(STAFF.name);
  });

  it('STAFF_NOT_FOUND이면 상세 재조회를 기다리지 않고 상세를 닫는다', async () => {
    navigation.search = 'staffId=42&tag=keep';
    vi.mocked(getStaffDetail).mockResolvedValueOnce(DETAIL);
    vi.mocked(getStaffList).mockResolvedValue({
      page: 1,
      size: 10,
      totalCount: 0,
      totalPage: 0,
      items: [],
    });
    vi.mocked(changeStaffEmploymentStatus).mockRejectedValue(
      new ApiError('STAFF_NOT_FOUND', 404, '아르바이트생을 찾을 수 없어요.'),
    );
    renderList();
    await screen.findByRole('button', { name: 'employed로 변경' });
    vi.mocked(getStaffDetail).mockImplementation(() => new Promise(() => {}));

    fireEvent.click(screen.getByRole('button', { name: 'employed로 변경' }));

    expect(
      await screen.findByText('아르바이트생을 찾을 수 없어요.'),
    ).toBeTruthy();
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() =>
      expect(screen.getByText('등록된 아르바이트생이 없어요.')).toBeTruthy(),
    );
    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      '',
      '/partTime/staff?tag=keep',
    );
  });

  it('이전 직원의 상태 변경이 404로 실패해도 다른 직원의 상세는 유지한다', async () => {
    navigation.search = 'staffId=42&tag=keep';
    let rejectChange!: (error: Error) => void;
    vi.mocked(getStaffDetail).mockImplementation(async (id) => ({
      ...DETAIL,
      id,
      name: id === 42 ? STAFF.name : '다른 직원',
    }));
    vi.mocked(changeStaffEmploymentStatus).mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectChange = reject;
        }),
    );
    const { rerender, client } = renderList();
    fireEvent.click(
      await screen.findByRole('button', { name: 'employed로 변경' }),
    );
    await waitFor(() => expect(changeStaffEmploymentStatus).toHaveBeenCalled());

    navigation.search = 'staffId=99&tag=keep';
    rerender(
      <QueryClientProvider client={client}>
        <PartTimeStaffList now={NOW} />
        <Toaster />
      </QueryClientProvider>,
    );
    await waitFor(() =>
      expect(screen.getByRole('dialog').textContent).toContain('다른 직원'),
    );
    await act(async () => rejectChange(new ApiError('STAFF_NOT_FOUND', 404)));

    expect(screen.getByRole('dialog').textContent).toContain('다른 직원');
    expect(window.history.replaceState).not.toHaveBeenCalled();
  });
});
