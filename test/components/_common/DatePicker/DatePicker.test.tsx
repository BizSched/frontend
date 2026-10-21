import '@testing-library/jest-dom/vitest';

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DatePicker } from '@components/_common/DatePicker/DatePicker';
import { Modal } from '@components/_common/Modal/Modal';

const SELECTED_DATE = new Date(2026, 9, 14);

const getSheetBackdrop = () => {
  const backdrop = document.querySelector(
    '[data-slot="date-picker-sheet-backdrop"]',
  );

  if (!(backdrop instanceof HTMLElement)) {
    throw new Error('날짜 시트 backdrop이 렌더되지 않았습니다.');
  }

  return backdrop;
};

const pressOutside = (element: HTMLElement) => {
  fireEvent.pointerDown(element);
  fireEvent.mouseDown(element);
  fireEvent.pointerUp(element);
  fireEvent.mouseUp(element);
  fireEvent.click(element);
};

beforeEach(() => {
  vi.stubGlobal('matchMedia', () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('DatePicker 바텀시트', () => {
  it('단독으로 열면 딤 backdrop을 렌더한다', async () => {
    render(<DatePicker defaultValue={SELECTED_DATE} />);

    fireEvent.click(screen.getByRole('button', { name: '2026.10.14' }));

    await screen.findByRole('dialog', { name: '날짜 선택' });
    expect(getSheetBackdrop()).toHaveClass('bg-overlay');
    expect(
      screen.getByRole('dialog', { name: '날짜 선택' }),
    ).not.toHaveAttribute('data-nested');
  });

  it('모달 안에서 열어도 backdrop을 클릭하면 날짜 시트만 닫고 onChange를 호출하지 않는다', async () => {
    const handleChange = vi.fn();
    const handleModalOpenChange = vi.fn();

    render(
      <Modal open onOpenChange={handleModalOpenChange}>
        <Modal.Panel aria-label="근무 추가">
          <DatePicker defaultValue={SELECTED_DATE} onChange={handleChange} />
        </Modal.Panel>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('button', { name: '2026.10.14' }));

    const sheet = await screen.findByRole('dialog', { name: '날짜 선택' });
    expect(sheet).toHaveAttribute('data-nested');

    pressOutside(getSheetBackdrop());

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: '날짜 선택' }),
      ).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('dialog', { name: '근무 추가' }),
    ).toBeInTheDocument();
    expect(handleModalOpenChange).not.toHaveBeenCalled();
    expect(handleChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole('button', { name: '2026.10.14' }),
    ).toBeInTheDocument();
  });
});
