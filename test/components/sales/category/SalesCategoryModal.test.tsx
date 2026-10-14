import '@testing-library/jest-dom/vitest';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { openConfirmModal } from '@components/_common/Modal/openConfirmModal';
import { SalesCategoryModal } from '@components/sales/category/SalesCategoryModal/SalesCategoryModal';

import { OverlayProvider } from '@providers/overlay/OverlayProvider';

import {
  createSalesCategory,
  deleteSalesCategory,
  getSalesCategories,
  updateSalesCategories,
} from '@lib/api/entities/sales-category/api';
import type { SalesCategory } from '@lib/api/entities/sales-category/toSalesCategory';

vi.mock('@lib/api/entities/sales-category/api', () => ({
  createSalesCategory: vi.fn(),
  deleteSalesCategory: vi.fn(),
  getSalesCategories: vi.fn(),
  updateSalesCategories: vi.fn(),
}));

vi.mock('@components/_common/Modal/openConfirmModal', () => ({
  openConfirmModal: vi.fn(),
}));

const originalMatchMedia = window.matchMedia;

const toCategories = (names: string[]): SalesCategory[] =>
  names.map((name, order) => ({
    id: order + 1,
    name,
    color: '#F26B1D',
    order,
  }));

let serverCategories: SalesCategory[];

const renderSalesCategoryModal = async () => {
  const close = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <OverlayProvider>
        <SalesCategoryModal
          overlayId="test"
          isOpen={true}
          close={close}
          unmount={() => {}}
          returnFocus={document.body}
        />
      </OverlayProvider>
    </QueryClientProvider>,
  );
  await screen.findByDisplayValue(serverCategories[0].name);
  return close;
};

const getNameInput = (name: string) =>
  screen.getByRole('textbox', { name: `${name} 카테고리 이름` });
const getNewNameInput = () =>
  screen.getByRole('textbox', { name: '새 카테고리 이름' });
const getAddButton = () => screen.getByRole('button', { name: /추가/ });
const getSaveButton = () => screen.getByRole('button', { name: '저장' });

beforeEach(() => {
  vi.resetAllMocks();
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  Element.prototype.scrollIntoView = vi.fn();
  serverCategories = toCategories(['음료', '디저트']);
  vi.mocked(getSalesCategories).mockImplementation(
    async () => serverCategories,
  );
});

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

describe('SalesCategoryModal', () => {
  it('조회한 카테고리를 이름 입력칸에 표시한다', async () => {
    await renderSalesCategoryModal();

    expect(getNameInput('음료')).toHaveValue('음료');
    expect(getNameInput('디저트')).toHaveValue('디저트');
  });

  it.each([
    ['빈 이름', '   '],
    ['공백만 다른 기존 이름', ' 음료 '],
  ])('%s은 추가할 수 없다', async (_, name) => {
    await renderSalesCategoryModal();

    fireEvent.change(getNewNameInput(), { target: { value: name } });

    expect(getAddButton()).toBeDisabled();
  });

  it('기존 이름과 겹치면 중복 문구를 표시한다', async () => {
    await renderSalesCategoryModal();

    fireEvent.change(getNewNameInput(), { target: { value: '음료' } });

    expect(screen.getByText('중복된 이름입니다.')).toBeInTheDocument();
  });

  it('카테고리가 10개면 추가할 수 없다', async () => {
    serverCategories = toCategories(
      Array.from({ length: 10 }, (_, index) => `카테고리${index}`),
    );
    await renderSalesCategoryModal();

    fireEvent.change(getNewNameInput(), { target: { value: '새 이름' } });

    expect(getAddButton()).toBeDisabled();
  });

  it('추가 버튼을 누르면 공백을 제거한 이름으로 바로 추가하고 입력을 비운다', async () => {
    vi.mocked(createSalesCategory).mockImplementation(async (name) => {
      serverCategories = toCategories(['음료', '디저트', name]);
      return serverCategories[2];
    });
    await renderSalesCategoryModal();

    fireEvent.change(getNewNameInput(), { target: { value: ' 커피 ' } });
    fireEvent.click(getAddButton());

    expect(await screen.findByDisplayValue('커피')).toBeInTheDocument();
    expect(createSalesCategory).toHaveBeenCalledWith('커피');
    expect(getNewNameInput()).toHaveValue('');
  });

  it('추가하면 새 행이 보이도록 스크롤하고 포커스는 옮기지 않는다', async () => {
    vi.mocked(createSalesCategory).mockImplementation(async (name) => {
      serverCategories = toCategories(['음료', '디저트', name]);
      return serverCategories[2];
    });
    await renderSalesCategoryModal();

    getNewNameInput().focus();
    fireEvent.change(getNewNameInput(), { target: { value: '커피' } });
    fireEvent.click(getAddButton());

    await waitFor(() =>
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled(),
    );
    expect(
      vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0],
    ).toContainElement(getNameInput('커피'));
    expect(getNewNameInput()).toHaveFocus();
  });

  it('추가하면 스크린리더에 알리고, 다음 입력에서 알림을 비운다', async () => {
    vi.mocked(createSalesCategory).mockImplementation(async (name) => {
      serverCategories = toCategories(['음료', '디저트', name]);
      return serverCategories[2];
    });
    await renderSalesCategoryModal();

    expect(screen.getByRole('status')).toHaveTextContent('');
    fireEvent.change(getNewNameInput(), { target: { value: '커피' } });
    fireEvent.click(getAddButton());

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        '커피 카테고리를 추가했습니다.',
      ),
    );
    fireEvent.input(getNameInput('음료'), { target: { value: '주스' } });

    expect(screen.getByRole('status')).toHaveTextContent('');
  });

  it('추가에 성공해도 저장하지 않은 이름 변경을 유지하고, 되돌리기는 서버 값으로 복원한다', async () => {
    vi.mocked(createSalesCategory).mockImplementation(async (name) => {
      serverCategories = toCategories(['음료', '디저트', name]);
      return serverCategories[2];
    });
    await renderSalesCategoryModal();

    fireEvent.change(getNameInput('음료'), { target: { value: '주스' } });
    fireEvent.change(getNewNameInput(), { target: { value: '커피' } });
    fireEvent.click(getAddButton());

    await screen.findByDisplayValue('커피');
    expect(getNameInput('음료')).toHaveValue('주스');

    fireEvent.click(screen.getByRole('button', { name: '되돌리기' }));

    expect(getNameInput('음료')).toHaveValue('음료');
    expect(getNameInput('커피')).toHaveValue('커피');
  });

  it('앞 행을 삭제해도 저장하지 않은 이름 변경은 같은 카테고리에 남는다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteSalesCategory).mockImplementation(async () => {
      serverCategories = serverCategories.slice(1);
    });
    vi.mocked(updateSalesCategories).mockResolvedValue([]);
    await renderSalesCategoryModal();

    fireEvent.change(getNameInput('디저트'), { target: { value: '케이크' } });
    fireEvent.click(screen.getByRole('button', { name: '음료 카테고리 삭제' }));

    await waitFor(() =>
      expect(screen.queryByDisplayValue('음료')).not.toBeInTheDocument(),
    );
    expect(getNameInput('디저트')).toHaveValue('케이크');
    fireEvent.click(getSaveButton());

    await waitFor(() =>
      expect(updateSalesCategories).toHaveBeenCalledWith([
        { id: 2, name: '케이크', order: 0 },
      ]),
    );
  });

  it('삭제 확인을 취소하면 요청하지 않는다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(false);
    await renderSalesCategoryModal();

    fireEvent.click(screen.getByRole('button', { name: '음료 카테고리 삭제' }));

    await waitFor(() => expect(openConfirmModal).toHaveBeenCalled());
    expect(deleteSalesCategory).not.toHaveBeenCalled();
  });

  it('삭제를 확인하면 해당 ID로 바로 삭제한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteSalesCategory).mockImplementation(async () => {
      serverCategories = serverCategories.slice(1);
    });
    await renderSalesCategoryModal();

    fireEvent.click(screen.getByRole('button', { name: '음료 카테고리 삭제' }));

    await waitFor(() =>
      expect(screen.queryByDisplayValue('음료')).not.toBeInTheDocument(),
    );
    expect(deleteSalesCategory).toHaveBeenCalledWith(1);
  });

  it('삭제 후 재조회가 실패해도 삭제된 행을 제거하고 저장 대상에서 제외한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteSalesCategory).mockResolvedValue(undefined);
    vi.mocked(updateSalesCategories).mockResolvedValue([]);
    await renderSalesCategoryModal();
    vi.mocked(getSalesCategories).mockRejectedValue(new Error('조회 실패'));

    fireEvent.click(screen.getByRole('button', { name: '음료 카테고리 삭제' }));

    await waitFor(() => {
      expect(getSalesCategories).toHaveBeenCalledTimes(2);
      expect(screen.queryByDisplayValue('음료')).not.toBeInTheDocument();
      expect(getSaveButton()).toBeEnabled();
    });
    expect(getNameInput('디저트')).toHaveValue('디저트');
    fireEvent.click(getSaveButton());

    await waitFor(() =>
      expect(updateSalesCategories).toHaveBeenCalledWith([
        { id: 2, name: '디저트', order: 0 },
      ]),
    );
  });

  it('삭제에 실패하면 기존 행을 유지하고 오류를 표시한다', async () => {
    vi.mocked(openConfirmModal).mockResolvedValue(true);
    vi.mocked(deleteSalesCategory).mockRejectedValue(new Error('삭제 실패'));
    await renderSalesCategoryModal();

    fireEvent.click(screen.getByRole('button', { name: '음료 카테고리 삭제' }));

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(getNameInput('음료')).toHaveValue('음료');
    expect(getNameInput('디저트')).toHaveValue('디저트');
    expect(getSalesCategories).toHaveBeenCalledTimes(1);
  });

  it('이름 변경은 저장할 때 전체 목록을 보내고 모달을 닫는다', async () => {
    vi.mocked(updateSalesCategories).mockResolvedValue([]);
    const close = await renderSalesCategoryModal();

    fireEvent.change(getNameInput('음료'), { target: { value: ' 주스 ' } });
    expect(updateSalesCategories).not.toHaveBeenCalled();
    fireEvent.click(getSaveButton());

    await waitFor(() => expect(close).toHaveBeenCalled());
    expect(updateSalesCategories).toHaveBeenCalledWith([
      { id: 1, name: '주스', order: 0 },
      { id: 2, name: '디저트', order: 1 },
    ]);
  });

  it('되돌리기는 저장하지 않은 이름 변경을 서버 값으로 복원한다', async () => {
    await renderSalesCategoryModal();

    fireEvent.change(getNameInput('음료'), { target: { value: '주스' } });
    fireEvent.click(screen.getByRole('button', { name: '되돌리기' }));

    expect(getNameInput('음료')).toHaveValue('음료');
  });

  it('이름이 겹치면 겹친 칸 모두에 중복 문구를 표시하고 저장할 수 없다', async () => {
    await renderSalesCategoryModal();

    fireEvent.change(getNameInput('디저트'), { target: { value: ' 음료' } });

    expect(getNameInput('음료')).toHaveAttribute('aria-invalid', 'true');
    expect(getNameInput('디저트')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getAllByText('중복된 이름입니다.')).toHaveLength(2);
    expect(getSaveButton()).toBeDisabled();
  });

  it('빈 이름이 있으면 저장할 수 없다', async () => {
    await renderSalesCategoryModal();

    fireEvent.change(getNameInput('음료'), { target: { value: '  ' } });

    expect(getSaveButton()).toBeDisabled();
  });

  it('저장에 실패하면 입력을 유지하고 오류를 표시한다', async () => {
    vi.mocked(updateSalesCategories).mockRejectedValue(new Error('failed'));
    const close = await renderSalesCategoryModal();

    fireEvent.change(getNameInput('음료'), { target: { value: '주스' } });
    fireEvent.click(getSaveButton());

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '매출 내역을 불러오지 못했습니다.',
    );
    expect(getNameInput('음료')).toHaveValue('주스');
    expect(close).not.toHaveBeenCalled();
  });
});
