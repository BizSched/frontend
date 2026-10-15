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

import type { PartTimeStaffDetailPanelProps } from '@components/partTime/staff/PartTimeStaffDetailPanel';
import { PartTimeStaffList } from '@components/partTime/staff/PartTimeStaffList';

import { staffKeys } from '@hooks/api/staff/staffQueryOptions';

import { ApiError } from '@lib/api/apiError';
import { getStaffDetail, getStaffList } from '@lib/api/entities/staff/api';
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
  getStaffList: vi.fn(),
  getStaffDetail: vi.fn(),
}));
vi.mock('@assets/icons/ic_empty.svg', () => ({ default: '/empty.svg' }));
vi.mock('@components/partTime/staff/PartTimeStaffCard', () => ({
  PartTimeStaffCard: ({
    staff,
    onDetailOpen,
  }: {
    staff: PartTimeStaffListItem;
    onDetailOpen: () => void;
  }) => <button onClick={onDetailOpen}>{staff.name}</button>,
}));
vi.mock('@components/partTime/staff/PartTimeStaffDetailPanel', () => ({
  PartTimeStaffDetailPanel: ({
    open,
    staff,
    listStaff,
    isLoading,
    error,
    onOpenChange,
  }: PartTimeStaffDetailPanelProps) =>
    open ? (
      <div role="dialog">
        <span>{staff?.name ?? listStaff?.name ?? '상세'}</span>
        {isLoading && <p>상세 로딩 중</p>}
        {!!error && <p>상세 오류</p>}
        <button onClick={() => onOpenChange(false)}>닫기</button>
      </div>
    ) : null,
}));

const STAFF = {
  id: 42,
  name: '김알바',
  phone: null,
  createdAt: '2026-10-14T09:00:00+09:00',
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
    </QueryClientProvider>,
  );
  return { ...result, client };
};

beforeEach(() => {
  vi.clearAllMocks();
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
  clients.forEach((client) => client.clear());
  clients.length = 0;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('PartTimeStaffList API 연동', () => {
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
