import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ActionButton } from '@components/_common/ActionButton/ActionButton';

afterEach(cleanup);

describe('ActionButton 개별 액션 비활성화', () => {
  it('비활성 액션은 실행하지 않고 다른 액션은 계속 사용할 수 있다', () => {
    const handleSave = vi.fn();
    const handleAdd = vi.fn();
    render(
      <ActionButton
        aria-label="액션 열기"
        defaultOpen
        actions={[
          {
            icon: null,
            label: '이미지 저장',
            onClick: handleSave,
            isDisabled: true,
          },
          { icon: null, label: '스케줄 추가', onClick: handleAdd },
        ]}
      />,
    );

    const save = screen.getByRole('menuitem', { name: '이미지 저장' });
    expect(save.getAttribute('aria-disabled')).toBe('true');
    fireEvent.click(save);
    expect(handleSave).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('menuitem', { name: '스케줄 추가' }));
    expect(handleAdd).toHaveBeenCalledTimes(1);
  });
});
