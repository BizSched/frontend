import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

import {
  createSalesCategory,
  deleteSalesCategory,
  updateSalesCategories,
} from '@lib/api/entities/sales-category/api';
import {
  create,
  delete4,
  updateAll,
} from '@lib/api/generated/sales-category/sales-category';

vi.mock('@lib/api/generated/sales-category/sales-category', () => ({
  create: vi.fn(),
  delete4: vi.fn(),
  findAll: vi.fn(),
  updateAll: vi.fn(),
}));

const CATEGORY = { id: 1, name: '음료', color: '#F26B1D', order: 0 };

describe('sales category api', () => {
  beforeEach(() => vi.resetAllMocks());

  it('카테고리를 이름으로 추가하고 검증한 카테고리를 반환한다', async () => {
    vi.mocked(create).mockResolvedValue(CATEGORY);

    await expect(createSalesCategory('음료')).resolves.toEqual(CATEGORY);
    expect(create).toHaveBeenCalledWith({ name: '음료' });
  });

  it('카테고리 이름·순서를 한 번에 수정하고 검증한 목록을 반환한다', async () => {
    const categories = [{ id: 1, name: '음료', order: 0 }];
    vi.mocked(updateAll).mockResolvedValue({ items: [CATEGORY] });

    await expect(updateSalesCategories(categories)).resolves.toEqual([
      CATEGORY,
    ]);
    expect(updateAll).toHaveBeenCalledWith({ categories });
  });

  it('카테고리를 ID로 삭제한다', async () => {
    vi.mocked(delete4).mockResolvedValue(undefined);

    await deleteSalesCategory(1);
    expect(delete4).toHaveBeenCalledWith(1);
  });

  it('응답이 계약과 다르면 ZodError를 던진다', async () => {
    vi.mocked(create).mockResolvedValue({ id: '1' } as never);

    await expect(createSalesCategory('음료')).rejects.toBeInstanceOf(ZodError);
  });
});
