import { describe, expect, it } from 'vitest';

import {
  countPartTimeMemoLength,
  limitPartTimeMemo,
  limitPartTimeText,
} from '@lib/utilities/partTime/partTimeTextInput';

describe('limitPartTimeText', () => {
  it('UTF-16 기준으로 자르고 이모지를 나누지 않는다', () => {
    expect(limitPartTimeText('가나다', 2)).toBe('가나');
    expect(limitPartTimeText('가😀', 2)).toBe('가');
  });
});

describe('limitPartTimeMemo', () => {
  it('메모를 UTF-16 500자로 제한하고 이모지를 나누지 않는다', () => {
    expect(limitPartTimeMemo('😀'.repeat(251))).toBe('😀'.repeat(250));
    expect(limitPartTimeMemo('가'.repeat(499) + '😀')).toBe('가'.repeat(499));
  });
});

describe('countPartTimeMemoLength', () => {
  it('공백제외는 줄바꿈을 포함한 모든 공백 문자를 뺀다', () => {
    expect(countPartTimeMemoLength('주말 오픈\n\t담당 ')).toEqual({
      withSpaces: 10,
      withoutSpaces: 6,
    });
  });

  it('빈 메모는 0자다', () => {
    expect(countPartTimeMemoLength('')).toEqual({
      withSpaces: 0,
      withoutSpaces: 0,
    });
  });
});
