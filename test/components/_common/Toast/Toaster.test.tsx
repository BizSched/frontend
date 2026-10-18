import '@testing-library/jest-dom/vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { Toaster, toast } from '@components/_common/Toast/Toaster';

afterEach(() => {
  cleanup();
  toast.dismiss();
});

describe('Toaster', () => {
  it('toast.success를 호출하면 메시지를 표시한다', async () => {
    render(<Toaster />);

    act(() => {
      toast.success('저장되었습니다');
    });

    expect(await screen.findByText('저장되었습니다')).toBeInTheDocument();
  });

  it('같은 id로 다시 호출하면 이전 toast를 교체한다', async () => {
    render(<Toaster />);

    act(() => {
      toast('첫번째', { id: 'save' });
    });
    expect(await screen.findByText('첫번째')).toBeInTheDocument();

    act(() => {
      toast('두번째', { id: 'save' });
    });

    expect(await screen.findByText('두번째')).toBeInTheDocument();
    expect(screen.queryByText('첫번째')).not.toBeInTheDocument();
  });
});
