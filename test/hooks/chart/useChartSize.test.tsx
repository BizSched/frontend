import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useChartSize } from '@hooks/chart/useChartSize';

const originalMatchMedia = window.matchMedia;

const mockMatchMedia = (matches: boolean) => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
};

afterEach(() => {
  window.matchMedia = originalMatchMedia;
  vi.restoreAllMocks();
});

describe('useChartSize', () => {
  it('matchMedia가 tablet 미만이면 small을 반환한다', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useChartSize());
    expect(result.current).toBe('small');
  });

  it('matchMedia가 tablet 이상이면 large를 반환한다', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useChartSize());
    expect(result.current).toBe('large');
  });

  it('size를 명시하면 matchMedia 판정을 건너뛴다', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useChartSize('large'));
    expect(result.current).toBe('large');
  });

  it('matchMedia가 없는 환경에서도 throw하지 않고 large를 반환한다', () => {
    // @ts-expect-error jsdom처럼 matchMedia가 없는 환경을 재현한다
    window.matchMedia = undefined;
    const { result } = renderHook(() => useChartSize());
    expect(result.current).toBe('large');
  });
});
