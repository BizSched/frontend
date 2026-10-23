import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import { COMMON_ERROR_MESSAGE } from '@lib/api/formatCommonError';

import MainError from '@app/(main)/error';

const boundary = vi.hoisted(() => ({ reset: vi.fn() }));
vi.mock('@tanstack/react-query', () => ({
  useQueryErrorResetBoundary: () => boundary,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('내부 오류 내용 대신 공통 문구를 표시하고 Query 경계부터 초기화한다', () => {
  const calls: string[] = [];
  boundary.reset.mockImplementation(() => calls.push('query'));
  const reset = vi.fn(() => calls.push('segment'));
  render(
    <MainError error={new Error('private upstream detail')} reset={reset} />,
  );
  expect(screen.getByRole('main')).toBeTruthy();
  expect(screen.getByRole('alert').textContent).toBe(COMMON_ERROR_MESSAGE);
  expect(screen.queryByText('private upstream detail')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
  expect(calls).toEqual(['query', 'segment']);
});
