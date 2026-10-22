import type { SyntheticEvent } from 'react';

import type { PartTimeMemoLength } from '@lib/types/partTimeTextInput';

const PART_TIME_MEMO_MAX_LENGTH = 500;

const isComposingInput = (event: SyntheticEvent) =>
  'isComposing' in event.nativeEvent && event.nativeEvent.isComposing === true;

const limitPartTimeText = (value: string, maxLength: number) => {
  const limited = value.slice(0, maxLength);
  return /[\uD800-\uDBFF]$/.test(limited) ? limited.slice(0, -1) : limited;
};

const limitPartTimeMemo = (value: string) =>
  limitPartTimeText(value, PART_TIME_MEMO_MAX_LENGTH);

const countPartTimeMemoLength = (memo: string): PartTimeMemoLength => ({
  withSpaces: memo.length,
  withoutSpaces: memo.replace(/\s/g, '').length,
});

export {
  PART_TIME_MEMO_MAX_LENGTH,
  countPartTimeMemoLength,
  isComposingInput,
  limitPartTimeMemo,
  limitPartTimeText,
};
